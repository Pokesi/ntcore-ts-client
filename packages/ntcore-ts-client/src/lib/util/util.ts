import { v4 as uuidv4 } from 'uuid';

import { NetworkTableTypeInfos } from '../types/types';

import type { BinaryMessage, NetworkTablesTypeInfo, NetworkTablesTypes, TypeNum, TypeString } from '../types/types';

/**
 * Class for holding utility functions.
 */
export class Util {
  private static usedIds: Set<number> = new Set();

  /**
   * Get the DOM time in microseconds.
   *
   * @returns The current microseconds of the DOM.
   */
  static getMicros() {
    return performance.now() * 1000;
  }

  /**
   * Given a number, determine if it is a double
   *
   * @param x - A number.
   * @returns Whether it is a double.
   */
  static isDouble(x: number) {
    if (typeof x === 'number' && Number.isFinite(x) && !Number.isInteger(x)) {
      return true;
    }

    return false;
  }

  /**
   * Given a value, find the NT type number.
   *
   * @param data - The value.
   * @returns The NT type number.
   */
  static getNetworkTableTypeFromObject(data: NetworkTablesTypes): NetworkTablesTypeInfo {
    if (typeof data === 'boolean') {
      return NetworkTableTypeInfos.kBoolean;
    } else if (typeof data === 'number') {
      if (this.isDouble(data)) {
        return NetworkTableTypeInfos.kDouble;
      }
      return NetworkTableTypeInfos.kInteger;
    } else if (typeof data === 'string') {
      return NetworkTableTypeInfos.kString;
    } else if (data instanceof ArrayBuffer) {
      return NetworkTableTypeInfos.kArrayBuffer;
    } else if (Array.isArray(data)) {
      if (new Set(data.map((x) => typeof x)).size <= 1) {
        if (typeof data[0] === 'boolean') {
          return NetworkTableTypeInfos.kBooleanArray;
        } else if (typeof data[0] === 'number') {
          if ((data as number[]).every((e) => this.isDouble(e))) {
            return NetworkTableTypeInfos.kDoubleArray;
          }
          return NetworkTableTypeInfos.kIntegerArray;
        } else if (typeof data[0] === 'string') {
          return NetworkTableTypeInfos.kStringArray;
        }
      }
    }
    throw new Error(`Invalid data for NT: ${data}`);
  }

  static getNetworkTableTypeFromTypeNum(typeNum: TypeNum) {
    switch (typeNum) {
      case NetworkTableTypeInfos.kBoolean[0]:
        return NetworkTableTypeInfos.kBoolean;
      case NetworkTableTypeInfos.kDouble[0]:
        return NetworkTableTypeInfos.kDouble;
      case NetworkTableTypeInfos.kInteger[0]:
        return NetworkTableTypeInfos.kInteger;
      case NetworkTableTypeInfos.kString[0]:
        return NetworkTableTypeInfos.kString;
      case NetworkTableTypeInfos.kArrayBuffer[0]:
        return NetworkTableTypeInfos.kArrayBuffer;
      case NetworkTableTypeInfos.kBooleanArray[0]:
        return NetworkTableTypeInfos.kBooleanArray;
      case NetworkTableTypeInfos.kDoubleArray[0]:
        return NetworkTableTypeInfos.kDoubleArray;
      case NetworkTableTypeInfos.kIntegerArray[0]:
        return NetworkTableTypeInfos.kIntegerArray;
      case NetworkTableTypeInfos.kStringArray[0]:
        return NetworkTableTypeInfos.kStringArray;
      default:
        throw new Error(`Invalid type number: ${typeNum}`);
    }
  }

  /**
   * Get the type info from a type string.
   *
   * @param typeString - The type string.
   * @returns The type info.
   */
  static getNetworkTableTypeFromTypeString(typeString: TypeString) {
    switch (typeString) {
      case NetworkTableTypeInfos.kBoolean[1]:
        return NetworkTableTypeInfos.kBoolean;
      case NetworkTableTypeInfos.kDouble[1]:
        return NetworkTableTypeInfos.kDouble;
      case NetworkTableTypeInfos.kInteger[1]:
        return NetworkTableTypeInfos.kInteger;
      case NetworkTableTypeInfos.kString[1]:
        return NetworkTableTypeInfos.kString;
      case NetworkTableTypeInfos.kArrayBuffer[1]:
        return NetworkTableTypeInfos.kArrayBuffer;
      case NetworkTableTypeInfos.kBooleanArray[1]:
        return NetworkTableTypeInfos.kBooleanArray;
      case NetworkTableTypeInfos.kDoubleArray[1]:
        return NetworkTableTypeInfos.kDoubleArray;
      case NetworkTableTypeInfos.kIntegerArray[1]:
        return NetworkTableTypeInfos.kIntegerArray;
      case NetworkTableTypeInfos.kStringArray[1]:
        return NetworkTableTypeInfos.kStringArray;
      default:
        throw new Error(`Unsupported type string: ${typeString}`);
    }
  }

  /**
   * Create a binary message from a topic.
   *
   * @param topicId - The topic ID.
   * @param timestamp - The timestamp of the message, matching the server.
   * @param data - The data.
   * @param typeInfo - The type info.
   * @returns The binary message.
   */
  static createBinaryMessage(
    topicId: number,
    timestamp: number,
    data: NetworkTablesTypes,
    typeInfo?: NetworkTablesTypeInfo
  ): BinaryMessage {
    const type = typeInfo ?? this.getNetworkTableTypeFromObject(data);
    return [topicId, timestamp, type[0], data];
  }

  /**
   * Get a decently unique integer ID.
   *
   * It is not guaranteed to be unique, but it uses uuidv4 to generate an integer ID.
   *
   * @returns An ID.
   */
  static generateUid(): number {
    const uuid = uuidv4();
    let id = 0;
    for (let i = 0; i < uuid.length; i++) {
      id += uuid.charCodeAt(i);
    }

    const uid = id + Date.now();

    // Just in case
    if (Util.usedIds.has(uid)) {
      return this.generateUid();
    }

    Util.usedIds.add(uid);
    return uid;
  }

  /**
   * Splits an ArrayBuffer into chunks of a specified size.
   *
   * @param buffer - The ArrayBuffer to split.
   * @param chunkSize - The size of each chunk, in bytes.
   * @returns An array of ArrayBuffer chunks.
   * @throws Error If the chunk size is not divisible by the ArrayBuffer size.
   */
  static splitArrayBuffer(buffer: ArrayBuffer, chunkSize: number) {
    if (buffer.byteLength % chunkSize !== 0) {
      throw new Error('Chunk size must be divisible by ArrayBuffer size');
    }
    const chunks: ArrayBuffer[] = [];
    let offset = 0;
    while (offset < buffer.byteLength) {
      const chunk = buffer.slice(offset, offset + chunkSize);
      chunks.push(chunk);
      offset += chunkSize;
    }
    return chunks;
  }

  static createServerUrl(uri: string, port: number): string {
    return `ws://${uri}:${port}/nt/${Util.generateUid()}`;
  }
}
