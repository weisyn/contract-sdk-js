/**
 * 我的第一个 NFT 合约 - 学习版
 * 
 * 🎯 学习目标：通过这个基础的NFT模板，你将学会：
 * ✅ 什么是NFT，与代币有什么区别
 * ✅ 如何创建独一无二的数字资产
 * ✅ 如何转移NFT所有权
 * ✅ 如何管理NFT的元数据信息
 * 
 * 📚 背景知识：
 * NFT (Non-Fungible Token) 就像数字收藏品：
 * - 每个都独一无二，不可互换
 * - 可以证明数字资产的所有权
 * - 广泛应用于艺术、游戏、证书等领域
 * 
 * 🔍 与代币的区别：
 * 代币：可互换（每个都相同）  NFT：不可互换（每个都独特）
 * 代币：可分割（0.5个）      NFT：不可分割（只能整个）
 * 代币：价值由数量决定       NFT：价值由稀有度决定
 * 
 * 编译命令：
 *   asc contract.ts --target release --outFile contract.wasm
 */

import { Contract, Context, ErrorCode } from '../../src/framework';
import { HostABI } from '../../src/runtime';
import { NFT } from '../../src/helpers/nft';

// ==================== NFT基本信息 ====================
//
// 💡 这些是你的NFT系列的"身份证"信息
// 可以根据你的项目需求修改这些值
const COLLECTION_NAME = '我的学习NFT系列'; // NFT系列名称
const COLLECTION_SYMBOL = 'LEARN-NFT'; // NFT系列符号
const BASE_TOKEN_URI = 'https://example.com/metadata/'; // 元数据基础URL

// ==================== 全局状态变量 ====================
//
// 📊 这些变量追踪NFT的状态信息
// 在实际的WES实现中，这些会通过UTXO系统管理
let totalSupply: u64 = 0; // 已铸造的NFT总数
let nextTokenID: u64 = 1; // 下一个NFT的ID

/**
 * Basic NFT 合约实例
 */
class BasicNFTContract extends Contract {
  /**
   * 合约初始化
   */
  onInit(params: Uint8Array): ErrorCode {
    // 初始化逻辑（如果有）
    totalSupply = 0;
    nextTokenID = 1;
    return ErrorCode.SUCCESS;
  }

  /**
   * 合约调用入口
   */
  onCall(functionName: string, params: Uint8Array): ErrorCode {
    if (functionName === 'MintNFT') {
      return this.mintNFT(params);
    } else if (functionName === 'TransferNFT') {
      return this.transferNFT(params);
    } else if (functionName === 'GetOwner') {
      return this.getOwner(params);
    } else if (functionName === 'GetTokenURI') {
      return this.getTokenURI(params);
    } else if (functionName === 'GetTotalSupply') {
      return this.getTotalSupply();
    } else if (functionName === 'GetBalance') {
      return this.getBalance(params);
    } else if (functionName === 'GetContractInfo') {
      return this.getContractInfo();
    }
    return ErrorCode.ERROR_NOT_FOUND;
  }

  /**
   * MintNFT函数 - NFT铸造功能
   * 
   * 🎯 函数作用：创建一个全新的、独一无二的NFT
   * 
   * 💡 工作原理：
   * 1. 生成唯一的NFT ID
   * 2. 将NFT所有权分配给指定地址
   * 3. 设置NFT的元数据链接
   * 4. 发出铸造事件
   * 
   * 🔍 生活化理解：
   * 就像艺术家创作一幅新画作，每幅画都有独特的编号和签名
   */
  private mintNFT(params: Uint8Array): ErrorCode {
    // 📍 步骤1：解析参数
    // 💭 铸造NFT需要什么信息？
    // - to: 将NFT给谁（接收者地址）
    // - tokenURI: NFT的元数据链接（描述这个NFT的详细信息）
    // 简化：假设参数是 JSON 格式 {"to":"...","tokenURI":"..."}
    // 实际实现中需要使用 JSON 解析工具
    
    // 📍 步骤2：参数验证
    // 🛡️ 确保输入数据的有效性
    // NFT铸造是不可逆的操作，必须严格检查
    const caller = Context.getCaller();
    const to = caller; // 简化：铸造给调用者
    
    // 如果没有提供tokenURI，使用默认格式
    const tokenID = `NFT_${nextTokenID.toString()}`;
    const tokenURI = BASE_TOKEN_URI + nextTokenID.toString() + '.json';
    
    // 📍 步骤3：生成唯一的NFT ID
    // 🆔 每个NFT都需要一个唯一的标识符
    // 就像每个人都有身份证号一样
    const nftTokenID = tokenID;
    nextTokenID++;
    totalSupply++;
    
    // 📍 步骤4：创建NFT（使用 NFT Helper）
    // 🌟 WES的NFT实现特色：
    // 在WES中，每个NFT都是一个独特的UTXO
    // 这确保了NFT的唯一性和不可复制性
    const metadata = Uint8Array.wrap(String.UTF8.encode(tokenURI));
    const result = NFT.mint(to, nftTokenID, metadata);
    
    if (result !== ErrorCode.SUCCESS) {
      // 撤销状态变更
      nextTokenID--;
      totalSupply--;
      return result;
    }
    
    // 📍 步骤5：发出铸造事件
    // 📢 NFT铸造事件包含什么信息？
    // - 接收者地址、NFT ID、元数据URI、铸造时间等
    // 这些信息让整个网络知道新的NFT被创建了
    const event = JSON.stringify({
      name: 'NFTMinted',
      to: this.addressToBase58(to),
      tokenID: nftTokenID,
      tokenURI: tokenURI,
      minter: this.addressToBase58(caller),
      timestamp: Context.getBlockTimestamp().toString(),
    });
    HostABI.emitEvent(event);
    
    // 🎉 NFT铸造成功！
    return ErrorCode.SUCCESS;
  }

  /**
   * TransferNFT函数 - NFT转移功能
   * 
   * 🎯 函数作用：将NFT从一个地址转移到另一个地址
   * 
   * 💡 工作原理：
   * 1. 验证发送方确实拥有这个NFT
   * 2. 转移NFT的UTXO所有权
   * 3. 发出转移事件
   * 
   * 🔍 生活化理解：
   * 就像把一幅画从你家搬到朋友家，需要确认你确实拥有这幅画
   */
  private transferNFT(params: Uint8Array): ErrorCode {
    // 📍 步骤1：解析参数
    // 简化：假设参数是 JSON 格式 {"from":"...","to":"...","tokenID":"..."}
    
    // 📍 步骤2：参数验证和权限检查
    // 🔒 安全检查：只有NFT的所有者才能转移它
    const caller = Context.getCaller();
    const from = caller; // 简化：从调用者转出
    
    // 简化：假设 tokenID 在参数中
    const tokenID = 'NFT_1'; // 示例
    
    // 📍 步骤3：验证NFT所有权
    // 🔍 检查发送方是否真的拥有这个NFT
    // 在WES中，这通过查询UTXO所有权来实现
    const owner = NFT.ownerOf(tokenID);
    if (owner === null) {
      return ErrorCode.ERROR_NOT_FOUND;
    }
    
    // 验证发送者是所有者
    if (!this.addressesEqual(owner, from)) {
      return ErrorCode.ERROR_UNAUTHORIZED;
    }
    
    // 📍 步骤4：执行NFT转移
    // 🔄 UTXO转移机制：
    // 销毁发送方的NFT UTXO，创建接收方的NFT UTXO
    // 这确保了NFT的唯一性：同一时间只能有一个所有者
    const to = Context.getContractAddress(); // 简化：转给合约地址
    const result = NFT.transfer(from, to, tokenID);
    
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }
    
    // 📍 步骤5：发出转移事件
    // 📢 记录NFT所有权的变更
    // 这为NFT提供了完整的所有权历史记录
    const event = JSON.stringify({
      name: 'NFTTransferred',
      from: this.addressToBase58(from),
      to: this.addressToBase58(to),
      tokenID: tokenID,
      operator: this.addressToBase58(caller),
      timestamp: Context.getBlockTimestamp().toString(),
    });
    HostABI.emitEvent(event);
    
    // ✅ NFT转移成功
    return ErrorCode.SUCCESS;
  }

  /**
   * GetOwner函数 - 所有者查询
   * 
   * 🎯 函数作用：查询指定NFT的当前所有者
   * 
   * 💡 工作原理：
   * 通过UTXO系统查询NFT的当前持有者
   * 
   * 🔍 生活化理解：
   * 就像查看一幅画现在挂在谁家一样
   */
  private getOwner(params: Uint8Array): ErrorCode {
    // 📍 获取查询参数
    // 简化：假设参数是 JSON 格式 {"tokenID":"..."}
    const tokenID = 'NFT_1'; // 示例
    
    // 📍 查询NFT所有者
    // 🔍 在WES中，通过查询UTXO的所有者来确定NFT的当前持有者
    // 这是一个高效且可靠的查询方式
    const owner = NFT.ownerOf(tokenID);
    
    // 📍 返回查询结果
    const result = JSON.stringify({
      tokenID: tokenID,
      owner: owner !== null ? this.addressToBase58(owner) : null,
      exists: owner !== null,
      collection_name: COLLECTION_NAME,
      collection_symbol: COLLECTION_SYMBOL,
      timestamp: Context.getBlockTimestamp().toString(),
    });
    
    const resultBytes = Uint8Array.wrap(String.UTF8.encode(result));
    HostABI.setReturnData(resultBytes);
    
    return ErrorCode.SUCCESS;
  }

  /**
   * GetTokenURI函数 - 元数据查询
   * 
   * 🎯 函数作用：获取NFT的元数据链接
   * 
   * 💡 工作原理：
   * 返回NFT的tokenURI，这个URI指向包含NFT详细信息的JSON文件
   * 
   * 🔍 生活化理解：
   * 就像查看一幅画的详细说明书，包含作者、创作时间、风格等信息
   */
  private getTokenURI(params: Uint8Array): ErrorCode {
    // 📍 获取查询参数
    // 简化：假设参数是 JSON 格式 {"tokenID":"..."}
    const tokenID = 'NFT_1'; // 示例
    
    // 📍 构造tokenURI
    // 🌐 元数据URI的构成：
    // 基础URL + NFT ID + .json扩展名
    // 例如：https://example.com/metadata/1.json
    const tokenURI = BASE_TOKEN_URI + tokenID.replace('NFT_', '') + '.json';
    
    // 📋 返回详细的元数据信息
    const result = JSON.stringify({
      tokenID: tokenID,
      tokenURI: tokenURI,
      collection: COLLECTION_NAME,
      symbol: COLLECTION_SYMBOL,
      exists: true,
      timestamp: Context.getBlockTimestamp().toString(),
    });
    
    const resultBytes = Uint8Array.wrap(String.UTF8.encode(result));
    HostABI.setReturnData(resultBytes);
    
    return ErrorCode.SUCCESS;
  }

  /**
   * GetTotalSupply函数 - 总量查询
   * 
   * 🎯 函数作用：查询已铸造的NFT总数
   * 
   * 🔍 生活化理解：
   * 就像统计博物馆总共收藏了多少件艺术品
   */
  private getTotalSupply(): ErrorCode {
    // 📊 返回NFT系列的统计信息
    const result = JSON.stringify({
      total_supply: totalSupply.toString(),
      next_token_id: nextTokenID.toString(),
      collection_name: COLLECTION_NAME,
      collection_symbol: COLLECTION_SYMBOL,
      base_uri: BASE_TOKEN_URI,
      timestamp: Context.getBlockTimestamp().toString(),
    });
    
    const resultBytes = Uint8Array.wrap(String.UTF8.encode(result));
    HostABI.setReturnData(resultBytes);
    
    return ErrorCode.SUCCESS;
  }

  /**
   * GetBalance函数 - 用户NFT数量查询
   * 
   * 🎯 函数作用：查询某个地址拥有多少个该系列的NFT
   * 
   * 🔍 生活化理解：
   * 就像统计某个收藏家拥有多少件某个艺术家的作品
   */
  private getBalance(params: Uint8Array): ErrorCode {
    // 📍 获取查询参数
    // 简化：假设参数是 JSON 格式 {"address":"..."}
    const caller = Context.getCaller();
    const address = caller; // 简化：查询调用者
    
    // 📍 统计用户拥有的NFT数量
    // 💡 在实际的WES实现中，需要遍历所有NFT ID
    // 检查每个NFT的当前所有者是否是查询的地址
    // 这里为了教学简化，返回示例数据
    const balance = 2; // 示例：该地址拥有2个NFT
    
    // 📊 返回余额信息
    const result = JSON.stringify({
      address: this.addressToBase58(address),
      balance: balance.toString(),
      collection_name: COLLECTION_NAME,
      collection_symbol: COLLECTION_SYMBOL,
      timestamp: Context.getBlockTimestamp().toString(),
    });
    
    const resultBytes = Uint8Array.wrap(String.UTF8.encode(result));
    HostABI.setReturnData(resultBytes);
    
    return ErrorCode.SUCCESS;
  }

  /**
   * GetContractInfo函数 - 合约信息
   * 
   * 🎯 函数作用：返回NFT合约的基本信息和元数据
   * 
   * 💡 学习重点：
   * ✅ 了解NFT合约的标准信息格式
   * ✅ 理解NFT系列的概念和属性
   * ✅ 学习如何提供完整的合约文档
   */
  private getContractInfo(): ErrorCode {
    // 📍 构建NFT合约信息
    // 🎯 标准NFT合约信息字段：
    // 遵循ERC721等标准，确保与钱包和市场的兼容性
    const result = JSON.stringify({
      // NFT系列基础信息
      name: COLLECTION_NAME,
      symbol: COLLECTION_SYMBOL,
      description: '这是一个学习用的基础NFT合约，展示WES NFT开发的核心功能',
      base_token_uri: BASE_TOKEN_URI,
      
      // 统计信息
      total_supply: totalSupply.toString(),
      max_supply: '无上限',
      next_token_id: nextTokenID.toString(),
      
      // 合约元信息
      version: '1.0.0',
      author: 'WES学习者',
      created_at: '2024',
      contract_type: 'Learning NFT',
      
      // 支持的功能特性
      features: [
        'NFT铸造功能',
        'NFT转移功能',
        '所有权查询',
        '元数据管理',
        '总量统计',
        '余额查询',
        'UTXO资产管理',
      ],
      
      // 技术信息
      blockchain: 'WES',
      language: 'TypeScript/AssemblyScript',
      standard: 'WES NFT',
      asset_model: 'UTXO-based',
      
      // 当前时间戳
      timestamp: Context.getBlockTimestamp().toString(),
    });
    
    const resultBytes = Uint8Array.wrap(String.UTF8.encode(result));
    HostABI.setReturnData(resultBytes);
    
    return ErrorCode.SUCCESS;
  }

  /**
   * 地址转Base58字符串（辅助方法）
   */
  private addressToBase58(address: Uint8Array): string {
    // 简化实现：实际应使用 HostABI.addressBytesToBase58
    return 'base58_address_placeholder';
  }

  /**
   * 比较两个地址是否相等（辅助方法）
   */
  private addressesEqual(addr1: Uint8Array, addr2: Uint8Array): bool {
    if (addr1.length !== addr2.length) {
      return false;
    }
    for (let i = 0; i < addr1.length; i++) {
      if (addr1[i] !== addr2[i]) {
        return false;
      }
    }
    return true;
  }
}

// 合约实例（单例模式）
const contract = new BasicNFTContract();

/**
 * 合约初始化函数（WASM 导出）
 */
export function Initialize(): u32 {
  const maxLen = 8192;
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onInit(params);
}

/**
 * 合约执行函数（WASM 导出）
 */
export function Execute(): u32 {
  const maxLen = 8192;
  // 简化：假设函数名通过其他方式传递
  // 实际实现中需要从 HostABI 获取函数名
  const functionName = 'MintNFT'; // 示例
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onCall(functionName, params);
}

