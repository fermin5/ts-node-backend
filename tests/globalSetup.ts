import { startServer } from './mocks/app';
import { Application } from 'express';

let serverInstance: { app: Application; close: () => Promise<void> };

export const getServerInstance = async () => {
  if (!serverInstance) {
    serverInstance = await startServer();
  }
  return serverInstance;
};

export const closeServerInstance = async () => {
  if (serverInstance && serverInstance.close) {
    await serverInstance.close();
  }
};