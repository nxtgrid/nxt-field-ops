import { compose, evolve, map, partition, zipObj, flatten } from 'ramda';

export const inferMetersToInstallPerConnection = connection => {
  const installedMeterTypes = connection.meters.map(({ meter_type }) => meter_type);
  const metersToInstall = connection.requested_meters
    .filter(({ meter_type }) => !installedMeterTypes.includes(meter_type));
  return { ...connection, metersToInstall };
};

const addExtraData = customer => {
  const connections = customer.connections.map(inferMetersToInstallPerConnection);
  const hasMetersToInstall = !!connections.flatMap(({ metersToInstall }) => metersToInstall).length;
  const hasPaidFees = customer.total_connection_paid >= customer.total_connection_fee;

  return { ...customer, connections, hasMetersToInstall, hasPaidFees };
};

export const getAssignableCustomers = compose(
  evolve({
    assignable: compose(
      flatten,
      // We partition 'assignable' customers again so customers with 0 meters installed are at the top
      partition(({ connections }) => connections.flatMap(({ meters }) => meters).length === 0),
    ),
  }),
  zipObj([ 'assignable', 'unassignable' ]),
  partition(({ hasMetersToInstall, hasPaidFees, connections }) =>
    // Invalid connections are: Without connection, without fees paid, or full (2 meters)
    connections.length && hasPaidFees && hasMetersToInstall),
  map(addExtraData),
);

/**
 * Single meter (@DUAL-SUPPORT FOR TRANSITIONING)
 */

export const inferMetersToInstallPerConnection_SM = connection => {
  const numInstalledMeters = connection.meters.length;
  if(numInstalledMeters > 0) return { ...connection, metersToInstall: [] };
  const numRequestedMeters = connection.requested_meters.length;
  if(numRequestedMeters < 1) return { ...connection, metersToInstall: [] };
  if(numRequestedMeters === 1) return { ...connection, metersToInstall: connection.requested_meters[0] };
  return { ...connection, metersToInstall: connection.requested_meters.filter(({ meter_type }) => meter_type === 'HPS') };
};

const addExtraData_SM = customer => {
  const connections = customer.connections.map(inferMetersToInstallPerConnection_SM);
  const hasMetersToInstall = !!connections.flatMap(({ metersToInstall }) => metersToInstall).length;
  const hasPaidFees = customer.total_connection_paid >= customer.total_connection_fee;

  return { ...customer, connections, hasMetersToInstall, hasPaidFees };
};

export const getAssignableCustomers_SM = compose(
  zipObj([ 'assignable', 'unassignable' ]),
  partition(({ hasMetersToInstall, hasPaidFees, connections }) =>
    connections.length && hasPaidFees && hasMetersToInstall),
  map(addExtraData_SM),
);
