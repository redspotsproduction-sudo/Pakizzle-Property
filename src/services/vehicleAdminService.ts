import { CarMake, CarModel, CarVariant } from '../types';

export const vehicleAdminService = {
  // Makes
  async getMakes(): Promise<CarMake[]> {
    const res = await fetch('/api/makes');
    if (!res.ok) throw new Error('Failed to fetch makes');
    return res.json();
  },

  async createMake(data: Partial<CarMake>): Promise<CarMake> {
    const res = await fetch('/api/admin/makes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create make');
    return res.json();
  },

  async updateMake(id: string | number, data: Partial<CarMake>): Promise<CarMake> {
    const res = await fetch(`/api/admin/makes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update make');
    return res.json();
  },

  async deleteMake(id: string | number): Promise<void> {
    const res = await fetch(`/api/admin/makes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete make');
  },

  // Models
  async getModels(makeId?: string | number): Promise<CarModel[]> {
    const url = makeId ? `/api/models?makeId=${makeId}` : '/api/models';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch models');
    return res.json();
  },

  async createModel(data: Partial<CarModel>): Promise<CarModel> {
    const res = await fetch('/api/admin/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create model');
    return res.json();
  },

  async updateModel(id: string | number, data: Partial<CarModel>): Promise<CarModel> {
    const res = await fetch(`/api/admin/models/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update model');
    return res.json();
  },

  async deleteModel(id: string | number): Promise<void> {
    const res = await fetch(`/api/admin/models/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete model');
  },

  // Variants
  async getVariants(modelId?: string | number): Promise<CarVariant[]> {
    const url = modelId ? `/api/variants?modelId=${modelId}` : '/api/variants';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch variants');
    return res.json();
  },

  async createVariant(data: Partial<CarVariant>): Promise<CarVariant> {
    const res = await fetch('/api/admin/variants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create variant');
    return res.json();
  },

  async updateVariant(id: string | number, data: Partial<CarVariant>): Promise<CarVariant> {
    const res = await fetch(`/api/admin/variants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update variant');
    return res.json();
  },

  async deleteVariant(id: string | number): Promise<void> {
    const res = await fetch(`/api/admin/variants/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete variant');
  }
};
