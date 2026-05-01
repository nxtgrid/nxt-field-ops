import { baseSupabaseRepo } from '@nxt/libraries/api-connection';

export const supabaseRepo = {
  ...baseSupabaseRepo,

  async fetchAllGridData(grid_id) {
    const gridPromise = this.client
      .from('grids')
      .select('uses_dual_meter_setup')
      .eq('id', grid_id)
      .maybeSingle()
      .then(this.handleResponse)
    ;

    const customersPromise = this.client
      .from('customers_with_account')
      .select(`
        id,
        full_name,
        total_connection_fee,
        total_connection_paid,
        longitude,
        latitude,
        connections(
          id,
          deleted_at,
          requested_meters:connection_requested_meters(
            meter_type,
            meter_phase,
            fee,
            deleted_at
          ),
          meters(
            id,
            external_reference,
            meter_type,
            meter_phase,
            deleted_at
          )
        )
      `)
      .match({ grid_id })
      .is('deleted_at', null)
      .order('full_name')
      .limit(1000000)
      .then(this.handleResponse)
      .then(customers => customers
        .map(({ connections, ...rest }) => ({
          ...rest,
          connections: connections
            .filter(({ deleted_at }) => !deleted_at)
            .map(({ id, requested_meters, meters }) => ({
              id,
              requested_meters: requested_meters.filter(({ deleted_at }) => !deleted_at),
              meters: meters.filter(({ deleted_at }) => !deleted_at),
            })),
        })))
    ;

    const unassignedMetersPromise = this.client
      .from('meters')
      .select('external_reference')
      .limit(1000000)
      .is('deleted_at', null)
      .is('connection_id', null)
      .then(this.handleResponse)
      .then(meters => meters.map(({ external_reference }) => external_reference))
    ;

    const [ { uses_dual_meter_setup }, customers, unassignedMeters ] =
      await Promise.all([ gridPromise, customersPromise, unassignedMetersPromise ]);

    return {
      uses_dual_meter_setup,
      customers,
      unassignedMeters,
    };
  },

  getMyMeters(grid_id, myAccountId) {
    return this.client
      .from('meters')
      .select(`
          external_reference,
          connection:connections!inner(
            customer:customers!inner(
              grid_id,
              ...accounts(
                full_name
              )
            )
          ),
          metering_hardware_install_sessions:last_metering_hardware_install_session_id!inner (
            metering_hardware_imports:last_metering_hardware_import_id!inner(
              metering_hardware_import_status
            ),
            meter_commissionings:last_meter_commissioning_id(
              meter_commissioning_status
            )
          )
        `)
      .is('deleted_at', null)
      .match({
        'connections.customers.grid_id': grid_id,
        'metering_hardware_install_sessions.author_id': myAccountId,
        'metering_hardware_install_sessions.metering_hardware_imports.metering_hardware_import_operation': 'ADD',
      })
      .limit(1000000)
      .then(supabaseRepo.handleResponse)
    ;
  },
};
