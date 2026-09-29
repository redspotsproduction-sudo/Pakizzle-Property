/**
 * Compatibility wrapper for PropertyContext
 * Re-exports everything from PropertyContext for zero-breakage backwards compatibility
 */
export * from './PropertyContext';
export { 
  PropertyContext as VehicleContext,
  PropertyProvider as VehicleProvider,
  useProperties as useVehicles
} from './PropertyContext';
