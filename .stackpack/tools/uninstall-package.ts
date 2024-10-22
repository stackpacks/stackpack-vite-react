import { spawn } from "node:child_process";

export const name = "uninstallPackage";

export const description = "Uninstall an npm package";

export const input = {
  type: "object",
  properties: {
    package: {
      type: "string",
      description: "The name of the package to uninstall",
    },
  },
  required: ["package"],
};

export const run = (
  input: { package: string },
  context: {
    workingDirectory: string;
    shellPath: string;
    signal: AbortSignal;
    succeed: (result: { stdout: string; stderr: string }) => unknown;
    fail: (result: {
      error: Error;
      exitCode: number | null;
      stdout: string;
      stderr: string;
    }) => void;
  },
) => {
  const proc = spawn("npm", ["uninstall", input.package], {
    stdio: ["ignore", "pipe", "pipe"],
    cwd: context.workingDirectory,
    shell: context.shellPath,
    signal: context.signal,
    env: process.env,
  });

  let stdout = "";
  let stderr = "";

  proc.stdout.on("data", (data: Buffer) => {
    stdout += data.toString();
  });

  proc.stderr.on("data", (data: Buffer) => {
    stderr += data.toString();
  });

  return new Promise((resolve, reject) => {
    proc.once("error", (error) => {
      reject(error);
    });

    proc.once("exit", (exitCode) => {
      if (exitCode === 0) {
        resolve(context.succeed({ stdout, stderr }));
      } else {
        resolve(
          context.fail({
            error: new Error(`Unexpected exit code`),
            exitCode,
            stdout,
            stderr,
          }),
        );
      }
    });
  });
};
