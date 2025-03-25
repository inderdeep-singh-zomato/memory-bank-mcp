declare module 'ssh2-sftp-client' {
  export interface FileStats {
    mode: number;
    uid: number;
    gid: number;
    size: number;
    accessTime: number;
    modifyTime: number;
    mtime: number;
    isDirectory: () => boolean;
    isFile: () => boolean;
    isBlockDevice: () => boolean;
    isCharacterDevice: () => boolean;
    isSymbolicLink: () => boolean;
    isFIFO: () => boolean;
    isSocket: () => boolean;
  }

  export default class Client {
    connect(config: {
      host: string;
      port: number;
      username: string;
      password?: string;
      privateKey?: string | Buffer;
    }): Promise<void>;
    
    list(path: string): Promise<{
      type: string;
      name: string;
      size: number;
      modifyTime: number;
      accessTime: number;
      rights: { user: string; group: string; other: string };
      owner: number | undefined;
      group: number | undefined;
    }[]>;
    
    get(path: string): Promise<Buffer>;
    put(input: Buffer | string, path: string): Promise<void>;
    mkdir(path: string, recursive?: boolean): Promise<void>;
    rmdir(path: string): Promise<void>;
    delete(path: string): Promise<void>;
    exists(path: string): Promise<boolean>;
    stat(path: string): Promise<FileStats>;
    end(): Promise<void>;
  }
} 