package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
	"github.com/aws/aws-sdk-go-v2/service/sesv2/types"
)

type Mailer interface {
	Send(ctx context.Context, to, subject, html, text string) error
}

type sesMailer struct {
	client *sesv2.Client
	from   string
	log    *slog.Logger
}

func newSESMailer(region, from string, log *slog.Logger) Mailer {
	if from == "" {
		from = "Pakizzle <noreply@pakizzle.amsterdamhostel.cloud>"
	}
	cfg, err := config.LoadDefaultConfig(context.Background(), config.WithRegion(region))
	if err != nil {
		log.Warn("ses init", "err", err)
		return &nopMailer{log: log}
	}
	return &sesMailer{client: sesv2.NewFromConfig(cfg), from: from, log: log}
}

func (m *sesMailer) Send(ctx context.Context, to, subject, html, text string) error {
	if m.client == nil {
		return errors.New("ses not configured")
	}
	out, err := m.client.SendEmail(ctx, &sesv2.SendEmailInput{
		FromEmailAddress: aws.String(m.from),
		Destination:      &types.Destination{ToAddresses: []string{to}},
		Content: &types.EmailContent{
			Simple: &types.Message{
				Subject: &types.Content{Data: aws.String(subject), Charset: aws.String("UTF-8")},
				Body: &types.Body{
					Html: &types.Content{Data: aws.String(html), Charset: aws.String("UTF-8")},
					Text: &types.Content{Data: aws.String(text), Charset: aws.String("UTF-8")},
				},
			},
		},
	})
	// The handler-level log records request-scoped duration_ms / purpose. Here we
	// emit a low-level mailer event with just the SES envelope details.
	if err != nil {
		m.log.Warn("mailer.ses error",
			"err", err,
			"subject", subject,
			"body_html_bytes", len(html),
		)
		return err
	}
	mid := ""
	if out != nil && out.MessageId != nil {
		mid = *out.MessageId
	}
	m.log.Debug("mailer.ses delivered",
		"message_id", mid,
		"subject", subject,
		"body_html_bytes", len(html),
	)
	return nil
}

type nopMailer struct{ log *slog.Logger }

func (m *nopMailer) Send(_ context.Context, to, subject, _, _ string) error {
	m.log.Info("nop mail", "to", to, "subject", subject)
	return errors.New("mailer not configured")
}

// ── templates ──────────────────────────────────────────────────────────────

func welcomeEmailHTML(name string) string {
	if name == "" {
		name = "there"
	}
	return fmt.Sprintf(`<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f5f5f7;padding:24px">
<table width="100%%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden">
  <tr><td style="padding:32px 32px 0">
    <div style="font-size:24px;font-weight:700;letter-spacing:-0.02em">Pakizzle<span style="color:#007AFF">.</span></div>
  </td></tr>
  <tr><td style="padding:24px 32px 8px">
    <h1 style="font-size:28px;line-height:1.15;margin:0 0 12px;letter-spacing:-0.02em">Welcome, %s.</h1>
    <p style="color:#6e6e73;font-size:15px;line-height:1.55;margin:0 0 20px">
      Pakizzle is Pakistan's smartest car marketplace. AI valuations, verified listings, futuristic experience — all in one place.
    </p>
    <a href="https://pakizzle.amsterdamhostel.cloud" style="display:inline-block;padding:14px 28px;background:#007AFF;color:#fff;font-weight:600;text-decoration:none;border-radius:999px">Open Pakizzle</a>
    <p style="color:#6e6e73;font-size:13px;line-height:1.55;margin:32px 0 0">
      Verify your email to earn the Basic badge and unlock chat, wishlist, and listing creation.
    </p>
  </td></tr>
  <tr><td style="padding:24px 32px 32px;color:#aaa;font-size:11px;border-top:1px solid #f0f0f0;margin-top:24px">
    © 2026 Pakizzle · Redspots Production
  </td></tr>
</table>
</body></html>`, name)
}

func welcomeEmailText(name string) string {
	if name == "" {
		name = "there"
	}
	return fmt.Sprintf("Welcome, %s.\n\nPakizzle is Pakistan's smartest car marketplace. Open: https://pakizzle.amsterdamhostel.cloud\n\nVerify your email to earn the Basic badge.\n\n— Pakizzle", name)
}

func otpEmailHTML(code string) string {
	return fmt.Sprintf(`<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f5f5f7;padding:24px">
<table width="100%%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden">
  <tr><td style="padding:32px 32px 0">
    <div style="font-size:24px;font-weight:700;letter-spacing:-0.02em">Pakizzle<span style="color:#007AFF">.</span></div>
  </td></tr>
  <tr><td style="padding:24px 32px 32px">
    <h1 style="font-size:24px;line-height:1.15;margin:0 0 12px;letter-spacing:-0.02em">Verify your email</h1>
    <p style="color:#6e6e73;font-size:15px;line-height:1.55;margin:0 0 20px">
      Enter this code in Pakizzle to confirm your email address. It expires in 10 minutes.
    </p>
    <div style="background:#f5f5f7;border-radius:16px;padding:24px;text-align:center;font-size:36px;font-weight:700;letter-spacing:0.4em">%s</div>
    <p style="color:#6e6e73;font-size:13px;line-height:1.55;margin:24px 0 0">
      Didn't request this? You can safely ignore the email.
    </p>
  </td></tr>
  <tr><td style="padding:0 32px 32px;color:#aaa;font-size:11px;border-top:1px solid #f0f0f0;margin-top:24px">
    © 2026 Pakizzle · Redspots Production
  </td></tr>
</table>
</body></html>`, code)
}

func otpEmailText(code string) string {
	return fmt.Sprintf("Your Pakizzle verification code: %s\n\nExpires in 10 minutes. If you didn't request this, ignore the email.\n", code)
}
