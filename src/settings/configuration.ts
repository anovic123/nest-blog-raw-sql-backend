enum Environments {
  DEVELOPMENT = 'DEVELOPMENT',
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION',
  TEST = 'TEST',
}

export type EnvironmentVariable = { [key: string]: string | undefined };

export type ConfigurationType = ReturnType<typeof getConfig>;

const getConfig = (
  environmentVariables: EnvironmentVariable,
  currentEnvironment: Environments,
) => {
  return {
    apiSettings: {
      PORT: Number.parseInt(environmentVariables.PORT ?? '3000'),
    },

    jwtSettings: {
      JWT_SECRET: environmentVariables.JWT_SECRET,
      HASH_ROUNDS: environmentVariables.HASH_ROUNDS,
      EXPIRES_ACCESS_TOKEN: environmentVariables.EXPIRES_ACCESS_TOKEN,
      EXPIRES_REFRESH_TOKEN: environmentVariables.EXPIRES_REFRESH_TOKEN,
    },

    basicSettings: {
      ADMIN_LOGIN: environmentVariables.ADMIN_LOGIN,
      ADMIN_PASSWORD: environmentVariables.ADMIN_PASSWORD,
    },

    environmentSettings: {
      currentEnv: currentEnvironment,
      isProduction: currentEnvironment === Environments.PRODUCTION,
      isStaging: currentEnvironment === Environments.STAGING,
      isTesting: currentEnvironment === Environments.TEST,
      isDevelopment: currentEnvironment === Environments.DEVELOPMENT,
    },
  };
};

export default () => {
  const environmentVariables = process.env;

  const currentEnvironment: Environments =
    environmentVariables.ENV as Environments;

  return getConfig(
    environmentVariables,
    currentEnvironment.toString().trim() as Environments,
  );
};