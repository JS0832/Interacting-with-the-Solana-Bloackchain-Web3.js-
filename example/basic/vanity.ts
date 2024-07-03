import { Keypair } from "@solana/web3.js"
import cluster from "cluster";
import os from "os";
import process from "process";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";

// Default to half your CPUs
const defaultWorkers: number = Math.max(1, os.cpus().length / 2);

/**
 * Check if an address matches the given prefix and suffix
 *
 * @returns true if the address matches the criteria
 */
const isValidVanityAddress = (
    address: string,
    prefix: string,
    suffix: string,
    caseSensitive: boolean
  ): boolean => {
    const addressToCheck = caseSensitive ? address : address.toLowerCase()
    const prefixToCheck = caseSensitive ? prefix : prefix.toLowerCase()
    const suffixToCheck = caseSensitive ? suffix : suffix.toLowerCase()
  
    return (
      addressToCheck.startsWith(prefixToCheck) &&
      addressToCheck.endsWith(suffixToCheck)
    )
  }
  
  /**
   * Generate a vanity address matching the provided prefix and suffix. If a
   * generated address does not match, the function will try again until a valid
   * address is generated.
   *
   * @returns a keypair containing the public and private keys for the vanity address
   */
  export const generateVanityAddress = (
    prefix: string,
    suffix: string,
    caseSensitive: boolean,
    incrementCounter: () => void
  ) => {
    let keypair = Keypair.generate()
  
    while (
      !isValidVanityAddress(
        keypair.publicKey.toBase58(),
        prefix,
        suffix,
        caseSensitive
      )
    ) {
      incrementCounter()
      keypair = Keypair.generate()
    }
  
    return keypair
  }

const exit = (err?: Error): void => {
  for (const id in cluster.workers) {
    const worker = cluster.workers[id];
    worker?.process.kill();
  }

  if (err) {
    console.error(err);
    process.exit(1);
  }

  process.exit(0);
};

// Define your parameters here
const prefix: string = ""; // Set your prefix here
const suffix: string = "pum"; // Set your suffix here
const caseSensitive: boolean = true; // Set your case sensitivity here
const qrCode: boolean = false; // Set whether to show QR code here
const workers: string = defaultWorkers.toString(); // Number of worker processes

if (cluster.isMaster || cluster.isPrimary) {
  let addressesGenerated: number = 0;
  const spinner = ora(`Generating vanity address`).start();
  const numWorkers: number = Number(workers);

  for (let i = 0; i < numWorkers; i++) {
    const childProcess = cluster.fork();
    childProcess.on("message", function (message) {
      if (message.keypair) {
        const successMessage: string = [
          `Done after ${addressesGenerated.toLocaleString()} addresses`,
          chalk.underline.blue("\nPublic Key:"),
          message.keypair.publicKey,
          chalk.underline.blue("Private Key:"),
          message.keypair.secretKey,
        ].join("\n");

        spinner.succeed(successMessage);
        exit();
      } else if (message.incrementCounter) {
        addressesGenerated++;
        spinner.text = `Generating vanity address (${addressesGenerated.toLocaleString()})`;
      }
    });
  }
} else {
  /**
   * Worker Process
   */
  const keypair = generateVanityAddress(
    prefix,
    suffix,
    caseSensitive,
    () => {
      process.send && process.send({ incrementCounter: true });
    }
  );

  if (keypair) {
    process.send &&
      process.send({
        keypair: {
          raw: keypair,
          publicKey: keypair.publicKey.toBase58(),
          secretKey: Buffer.from(keypair.secretKey).toString("hex"),
        },
      });
  }
}
