/**
 * HostABI Mock 实现
 * 
 * 用于集成测试，模拟 WES 节点的 HostABI 环境
 * 
 * 注意：此文件使用 TypeScript 类型，避免导入 AssemblyScript 源代码
 */

// 测试专用的类型定义（避免导入 AssemblyScript 源代码）
type MockOutPoint = {
  txHash: Uint8Array;
  index: number;
};

type MockHash = Uint8Array;

type MockTxOutput = {
  type: number;
  recipient: Uint8Array | null;
  amount: number;
  tokenID: string | null;
};

type MockUTXO = {
  outPoint: MockOutPoint;
  output: MockTxOutput;
};

type MockResource = {
  contentHash: MockHash;
  category: number;
  mimeType: string;
  size: number;
};

export class MockHostABI {
  private utxos: Map<string, MockUTXO> = new Map();
  private resources: Map<string, MockResource> = new Map();
  private blockHeight: number = 1000;
  private blockTimestamp: number = Date.now();
  private caller: Uint8Array = new Uint8Array(20);
  private contractAddress: Uint8Array = new Uint8Array(20);
  private txHash: Uint8Array = new Uint8Array(32);
  private chainID: Uint8Array = new Uint8Array(32);
  private txIndex: number = 0;
  private blockHashes: Map<number, Uint8Array | null> = new Map();
  private merkleRoots: Map<number, Uint8Array | null> = new Map();
  private stateRoots: Map<number, Uint8Array | null> = new Map();
  private stateVersions: Map<string, number> = new Map();
  private states: Map<string, Uint8Array | null> = new Map();
  private addressBase58Map: Map<string, string | null> = new Map();
  private base58AddressMap: Map<string, Uint8Array | null> = new Map();

  constructor() {
    // 初始化默认值
    this.caller.fill(0x01);
    this.contractAddress.fill(0x02);
    this.txHash.fill(0x03);
    this.chainID.fill(0x04);
  }

  /**
   * 设置调用者地址
   */
  setCaller(address: Uint8Array): void {
    this.caller = address;
  }

  /**
   * 设置合约地址
   */
  setContractAddress(address: Uint8Array): void {
    this.contractAddress = address;
  }

  /**
   * 设置区块高度
   */
  setBlockHeight(height: number): void {
    this.blockHeight = height;
  }

  /**
   * 设置区块时间戳
   */
  setBlockTimestamp(timestamp: number): void {
    this.blockTimestamp = timestamp;
  }

  /**
   * 添加 UTXO
   */
  addUTXO(outPoint: MockOutPoint, utxo: MockUTXO): void {
    const key = this.outPointKey(outPoint);
    this.utxos.set(key, utxo);
  }

  /**
   * 添加 Resource
   */
  addResource(contentHash: MockHash, resource: MockResource): void {
    const key = this.hashKey(contentHash);
    this.resources.set(key, resource);
  }

  /**
   * 获取调用者地址
   */
  getCaller(): Uint8Array {
    return this.caller;
  }

  /**
   * 获取合约地址
   */
  getContractAddress(): Uint8Array {
    return this.contractAddress;
  }

  /**
   * 获取区块高度
   */
  getBlockHeight(): number {
    return this.blockHeight;
  }

  /**
   * 获取区块时间戳
   */
  getBlockTimestamp(): number {
    return this.blockTimestamp;
  }

  /**
   * 获取交易哈希
   */
  getTxHash(): Uint8Array {
    return this.txHash;
  }

  /**
   * 获取链 ID
   */
  getChainID(): Uint8Array {
    return this.chainID;
  }

  /**
   * 查询 UTXO
   */
  utxoLookup(outPoint: MockOutPoint): MockUTXO | null {
    const key = this.outPointKey(outPoint);
    const utxo = this.utxos.get(key);
    return utxo || null;
  }

  /**
   * 查询 Resource
   */
  resourceLookup(contentHash: MockHash): MockResource | null {
    const key = this.hashKey(contentHash);
    return this.resources.get(key) || null;
  }

  /**
   * 生成 OutPoint 键
   */
  private outPointKey(outPoint: MockOutPoint): string {
    const txHashStr = Array.from(outPoint.txHash)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `${txHashStr}:${outPoint.index}`;
  }

  /**
   * 生成 Hash 键
   */
  private hashKey(hash: MockHash): string {
    return Array.from(hash)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * 设置交易索引
   */
  setTxIndex(index: number): void {
    this.txIndex = index;
  }

  /**
   * 获取交易索引
   */
  getTxIndex(): number {
    return this.txIndex;
  }

  /**
   * 设置区块哈希
   */
  setBlockHash(height: number, hash: Uint8Array | null): void {
    this.blockHashes.set(height, hash);
  }

  /**
   * 获取区块哈希
   */
  getBlockHash(height: number): Uint8Array | null {
    const hash = this.blockHashes.get(height);
    if (hash !== undefined) {
      return hash;
    }
    // 默认返回一个哈希
    const defaultHash = new Uint8Array(32);
    defaultHash.fill(height & 0xFF);
    return defaultHash;
  }

  /**
   * 设置 Merkle 根
   */
  setMerkleRoot(height: number, root: Uint8Array | null): void {
    this.merkleRoots.set(height, root);
  }

  /**
   * 获取 Merkle 根
   */
  getMerkleRoot(height: number): Uint8Array | null {
    const root = this.merkleRoots.get(height);
    if (root !== undefined) {
      return root;
    }
    // 默认返回一个根
    const defaultRoot = new Uint8Array(32);
    defaultRoot.fill(height & 0xFF);
    return defaultRoot;
  }

  /**
   * 设置状态根
   */
  setStateRoot(height: number, root: Uint8Array | null): void {
    this.stateRoots.set(height, root);
  }

  /**
   * 获取状态根
   */
  getStateRoot(height: number): Uint8Array | null {
    const root = this.stateRoots.get(height);
    if (root !== undefined) {
      return root;
    }
    // 默认返回一个根
    const defaultRoot = new Uint8Array(32);
    defaultRoot.fill(height & 0xFF);
    return defaultRoot;
  }

  /**
   * 设置状态版本
   */
  setStateVersion(stateID: string, version: number): void {
    this.stateVersions.set(stateID, version);
  }

  /**
   * 获取状态版本
   */
  getStateVersion(stateID: string): number {
    return this.stateVersions.get(stateID) || 0;
  }

  /**
   * 设置状态值
   */
  setState(key: string, value: Uint8Array | null): void {
    this.states.set(key, value);
  }

  /**
   * 获取状态值
   */
  getState(key: string): Uint8Array | null {
    return this.states.get(key) || null;
  }

  /**
   * 设置地址 Base58 编码映射
   */
  setAddressBytesToBase58(address: Uint8Array, base58: string | null): void {
    const key = this.addressKey(address);
    this.addressBase58Map.set(key, base58);
  }

  /**
   * 设置 Base58 地址解码映射
   */
  setAddressBase58ToBytes(base58: string, address: Uint8Array | null): void {
    this.base58AddressMap.set(base58, address);
  }

  /**
   * 地址转 Base58（Mock）
   */
  addressBytesToBase58(address: Uint8Array): string | null {
    const key = this.addressKey(address);
    return this.addressBase58Map.get(key) || null;
  }

  /**
   * Base58 转地址（Mock）
   */
  addressBase58ToBytes(base58: string): Uint8Array | null {
    return this.base58AddressMap.get(base58) || null;
  }

  /**
   * 生成地址键
   */
  private addressKey(address: Uint8Array): string {
    return Array.from(address)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * 重置所有状态
   */
  reset(): void {
    this.utxos.clear();
    this.resources.clear();
    this.blockHeight = 1000;
    this.blockTimestamp = Date.now();
    this.caller = new Uint8Array(20);
    this.contractAddress = new Uint8Array(20);
    this.txHash = new Uint8Array(32);
    this.chainID = new Uint8Array(32);
    this.txIndex = 0;
    this.blockHashes.clear();
    this.merkleRoots.clear();
    this.stateRoots.clear();
    this.stateVersions.clear();
    this.states.clear();
    this.addressBase58Map.clear();
    this.base58AddressMap.clear();
    this.caller.fill(0x01);
    this.contractAddress.fill(0x02);
    this.txHash.fill(0x03);
    this.chainID.fill(0x04);
  }
}

