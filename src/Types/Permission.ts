export type PermissionDefinition = {
  name: `${string}.${string}`;
  description: string;
};

export type JsonPermissions = {
  [resource: string]: {
    [action: string]: PermissionDefinition;
  };
};