export const mergeUnsyncedMetersOnCloudCustomers = (cloudCustomers, unsyncedMeters) => cloudCustomers.map(customer => {
  const _unsyncedMeters = unsyncedMeters.filter(({ customer_id }) => customer_id === customer.id);
  if(!_unsyncedMeters.length) return customer;
  const _connections = customer.connections
    .map(connection => {
      const meters = _unsyncedMeters.filter(({ connection_id }) => connection_id === connection.id);
      if(!meters.length) return connection;
      return {
        ...connection,
        meters: [
          ...connection.meters,
          ...meters.map(({ external_reference, meter_type }) =>
            ({ external_reference, meter_type, unsynced: true })) ],
      };
    });
  return { ...customer, connections: _connections };
});
