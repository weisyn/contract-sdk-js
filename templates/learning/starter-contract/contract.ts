/**
 * 自定义合约开发 - 入门模板
 * 
 * 🎯 学习目标：通过这个入门模板，你将学会：
 * ✅ 从零开始构建智能合约
 * ✅ 设计和实现自己的业务逻辑
 * ✅ 应用合约开发的最佳实践
 * ✅ 创建符合自己需求的独特功能
 * 
 * 📚 使用说明：
 * 这是一个空白但结构完整的合约模板
 * 你可以根据自己的项目需求，选择需要的功能模块进行实现
 * 每个模块都有详细的注释和实现建议
 * 
 * 🚀 开始建议：
 * 1. 先阅读完整个文件，理解整体结构
 * 2. 根据项目需求选择要实现的功能模块
 * 3. 从最核心的功能开始实现
 * 4. 逐步添加其他功能，每次添加后都要测试
 * 
 * 编译命令：
 *   asc contract.ts --target release --outFile contract.wasm
 */

import { Contract, Context, ErrorCode } from '../../src/framework';
import { HostABI } from '../../src/runtime';
import { Token } from '../../src/helpers/token';
import { Governance } from '../../src/helpers/governance';

// ==================== 合约配置区 ====================
//
// 💡 这里定义合约的基本信息和配置
// 这些信息会在合约部署后成为合约的"身份证"
const CONTRACT_NAME = '我的自定义合约'; // 合约名称，改为你的项目名
const CONTRACT_SYMBOL = 'CUSTOM'; // 合约符号，通常是3-5个字母
const CONTRACT_VERSION = '1.0.0'; // 版本号，建议使用语义化版本
const CONTRACT_DESCRIPTION = '这是一个自定义的智能合约模板'; // 合约描述
const CONTRACT_AUTHOR = '你的名字'; // 作者信息

// ⚙️ 功能配置
const MAX_USERS: u64 = 10000; // 最大用户数（如果需要限制）
const TRANSACTION_FEE: u64 = 10; // 交易手续费（如果需要）
const MIN_STAKE_AMOUNT: u64 = 100; // 最小质押金额（如果有质押功能）

// 🔒 权限配置
const ADMIN_ROLE = 'admin'; // 管理员角色
const USER_ROLE = 'user'; // 普通用户角色
const MODERATOR_ROLE = 'moderator'; // 版主角色

// ==================== 状态管理区 ====================
//
// 💭 这里定义合约需要跟踪的状态变量
// 在实际的WES实现中，这些状态通过UTXO系统管理
let totalUsers: u64 = 0; // 总用户数
let totalSupply: u64 = 0; // 总发行量（如果是代币合约）
let proposalCount: u64 = 0; // 提案总数
let gameRounds: u64 = 0; // 游戏轮数（如果是游戏合约）
let isPaused: bool = false; // 合约是否暂停
let isInitialized: bool = false; // 合约是否已初始化

/**
 * Starter Contract 合约实例
 */
class StarterContract extends Contract {
  /**
   * 合约初始化
   */
  onInit(params: Uint8Array): ErrorCode {
    // 📍 步骤1：检查是否已经初始化
    if (isInitialized) {
      return ErrorCode.ERROR_ALREADY_EXISTS;
    }

    // 📍 步骤2：验证调用者权限（可选）
    // const caller = Context.getCaller();
    // if (!this.isAuthorized(caller)) {
    //     return ErrorCode.ERROR_UNAUTHORIZED;
    // }

    // 📍 步骤3：设置初始状态
    isInitialized = true;
    totalUsers = 0;
    totalSupply = 1000000; // 示例：初始发行100万代币

    // 📍 步骤4：发出初始化事件
    const caller = Context.getCaller();
    const event = JSON.stringify({
      name: 'ContractInitialized',
      contract: CONTRACT_NAME,
      owner: this.addressToBase58(caller),
      version: CONTRACT_VERSION,
      timestamp: Context.getBlockTimestamp().toString(),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * 合约调用入口
   */
  onCall(functionName: string, params: Uint8Array): ErrorCode {
    // 功能模块1：用户管理
    if (functionName === 'RegisterUser') {
      return this.registerUser(params);
    } else if (functionName === 'GetUserInfo') {
      return this.getUserInfo(params);
    }
    
    // 功能模块2：资产管理
    else if (functionName === 'TransferAsset') {
      return this.transferAsset(params);
    } else if (functionName === 'GetAssetBalance') {
      return this.getAssetBalance(params);
    }
    
    // 功能模块3：投票治理
    else if (functionName === 'CreateProposal') {
      return this.createProposal(params);
    } else if (functionName === 'Vote') {
      return this.vote(params);
    }
    
    // 功能模块4：时间锁
    else if (functionName === 'LockAsset') {
      return this.lockAsset(params);
    } else if (functionName === 'UnlockAsset') {
      return this.unlockAsset(params);
    }
    
    // 功能模块5：游戏逻辑
    else if (functionName === 'PlayGame') {
      return this.playGame(params);
    } else if (functionName === 'GetGameStats') {
      return this.getGameStats(params);
    }
    
    // 查询接口
    else if (functionName === 'GetContractInfo') {
      return this.getContractInfo();
    } else if (functionName === 'GetContractStats') {
      return this.getContractStats();
    }
    
    // 管理功能
    else if (functionName === 'PauseContract') {
      return this.pauseContract();
    } else if (functionName === 'ResumeContract') {
      return this.resumeContract();
    }

    return ErrorCode.ERROR_NOT_FOUND;
  }

  // ==================== 功能模块1：用户管理 ====================
  //
  // 🎯 适用场景：需要用户注册、权限管理的合约
  // 💡 包含功能：用户注册、信息查询、权限管理

  /**
   * RegisterUser 用户注册功能
   * 
   * 🎯 函数作用：注册新用户到系统中
   * 💡 可以扩展为包含用户资料、权限等信息
   */
  private registerUser(params: Uint8Array): ErrorCode {
    // 📍 步骤1：检查合约状态
    if (!isInitialized) {
      return ErrorCode.ERROR_INVALID_STATE;
    }

    if (isPaused) {
      return ErrorCode.ERROR_INVALID_STATE;
    }

    // 📍 步骤2：获取注册参数
    // 简化：假设参数是 JSON 格式 {"username":"...","email":"..."}
    // 实际实现中需要使用 JSON 解析工具

    // 📍 步骤3：参数验证
    // 检查用户数量限制
    if (totalUsers >= MAX_USERS) {
      return ErrorCode.ERROR_INVALID_STATE;
    }

    // 📍 步骤4：执行注册逻辑
    const caller = Context.getCaller();

    // 💡 在实际实现中，这里会：
    // - 检查用户是否已经注册
    // - 创建用户UTXO
    // - 存储用户信息

    // 更新状态
    totalUsers++;

    // 📍 步骤5：发出注册事件
    const event = JSON.stringify({
      name: 'UserRegistered',
      user: this.addressToBase58(caller),
      username: 'example_user',
      userID: totalUsers.toString(),
      timestamp: Context.getBlockTimestamp().toString(),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * GetUserInfo 用户信息查询
   * 
   * 🎯 函数作用：查询用户的详细信息
   */
  private getUserInfo(params: Uint8Array): ErrorCode {
    // 📍 获取查询参数
    // 简化：假设参数是 JSON 格式 {"address":"..."}
    const caller = Context.getCaller();
    const address = caller; // 简化：查询调用者

    // 📍 查询用户信息
    // 💡 在实际实现中，这里会从UTXO系统查询用户数据
    const result = JSON.stringify({
      address: this.addressToBase58(address),
      username: '示例用户',
      registerTime: '2024-01-01',
      role: USER_ROLE,
      isActive: true,
      timestamp: Context.getBlockTimestamp().toString(),
    });

    const resultBytes = Uint8Array.wrap(String.UTF8.encode(result));
    HostABI.setReturnData(resultBytes);

    return ErrorCode.SUCCESS;
  }

  // ==================== 功能模块2：资产管理 ====================
  //
  // 🎯 适用场景：需要管理代币、积分、资产的合约
  // 💡 包含功能：资产转移、余额查询、发行管理

  /**
   * TransferAsset 资产转移功能
   * 
   * 🎯 函数作用：在用户之间转移资产
   * 💡 可以是代币、积分或其他可量化的资产
   */
  private transferAsset(params: Uint8Array): ErrorCode {
    // 📍 步骤1：获取转移参数
    // 简化：假设参数是 JSON 格式 {"to":"...","amount":"...","assetType":"..."}

    // 📍 步骤2：参数验证
    const caller = Context.getCaller();
    const to = Context.getContractAddress(); // 简化：转给合约地址
    const amount: u64 = 1000; // 示例金额
    const tokenID: string | null = null; // 原生币

    // 📍 步骤3：执行转移
    const result = Token.transfer(caller, to, amount, tokenID);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }

    // 📍 步骤4：发出转移事件
    const event = JSON.stringify({
      name: 'AssetTransferred',
      from: this.addressToBase58(caller),
      to: this.addressToBase58(to),
      amount: amount.toString(),
      assetType: 'token',
      timestamp: Context.getBlockTimestamp().toString(),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * GetAssetBalance 资产余额查询
   * 
   * 🎯 函数作用：查询用户的资产余额
   */
  private getAssetBalance(params: Uint8Array): ErrorCode {
    // 📍 获取查询参数
    const caller = Context.getCaller();
    const address = caller; // 简化：查询调用者
    const tokenID: string | null = null; // 原生币

    // 📍 查询余额
    const balance = HostABI.queryUTXOBalance(address, tokenID);

    // 📍 返回查询结果
    const result = JSON.stringify({
      address: this.addressToBase58(address),
      assetType: 'token',
      balance: balance.toString(),
      symbol: CONTRACT_SYMBOL,
      timestamp: Context.getBlockTimestamp().toString(),
    });

    const resultBytes = Uint8Array.wrap(String.UTF8.encode(result));
    HostABI.setReturnData(resultBytes);

    return ErrorCode.SUCCESS;
  }

  // ==================== 功能模块3：投票治理 ====================
  //
  // 🎯 适用场景：需要社区决策、投票功能的合约
  // 💡 包含功能：创建提案、投票、执行决议

  /**
   * CreateProposal 创建提案功能
   * 
   * 🎯 函数作用：创建新的治理提案
   * 💡 提案可以是参数修改、功能升级等决策
   */
  private createProposal(params: Uint8Array): ErrorCode {
    // 📍 步骤1：获取提案参数
    // 简化：假设参数是 JSON 格式 {"title":"...","description":"...","type":"..."}

    // 📍 步骤2：参数验证
    const title = '示例提案'; // 示例
    const description = '这是一个示例提案'; // 示例
    const proposalType = 'general'; // 示例

    // 📍 步骤3：创建提案
    proposalCount++;
    const proposalID = proposalCount;

    // 💡 在实际实现中，这里会：
    // - 存储提案详细信息
    // - 设置投票期限
    // - 初始化投票统计

    // 📍 步骤4：发出提案事件
    const caller = Context.getCaller();
    const event = JSON.stringify({
      name: 'ProposalCreated',
      proposalID: proposalID.toString(),
      title: title,
      type: proposalType,
      proposer: this.addressToBase58(caller),
      timestamp: Context.getBlockTimestamp().toString(),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * Vote 投票功能
   * 
   * 🎯 函数作用：对提案进行投票
   */
  private vote(params: Uint8Array): ErrorCode {
    // 📍 步骤1：获取投票参数
    // 简化：假设参数是 JSON 格式 {"proposalID":"...","choice":"..."}
    const proposalID: u64 = 1; // 示例
    const support = true; // 示例：支持

    // 📍 步骤2：参数验证
    if (proposalID === 0 || proposalID > proposalCount) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 📍 步骤3：执行投票
    const voter = Context.getCaller();
    const proposalIDBytes = Uint8Array.wrap(String.UTF8.encode(proposalID.toString()));
    
    // 使用 Governance Helper 进行投票
    const result = Governance.vote(voter, proposalIDBytes, support);
    if (result !== ErrorCode.SUCCESS) {
      return result;
    }

    // 📍 步骤4：发出投票事件
    const event = JSON.stringify({
      name: 'VoteCast',
      proposalID: proposalID.toString(),
      voter: this.addressToBase58(voter),
      choice: support ? 'yes' : 'no',
      timestamp: Context.getBlockTimestamp().toString(),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  // ==================== 功能模块4：时间锁 ====================
  //
  // 🎯 适用场景：需要定时执行、锁定期的合约
  // 💡 包含功能：资产锁定、定时解锁、锁定查询

  /**
   * LockAsset 资产锁定功能
   * 
   * 🎯 函数作用：锁定资产一段时间
   * 💡 锁定期间资产不能转移，到期后自动解锁
   */
  private lockAsset(params: Uint8Array): ErrorCode {
    // 📍 步骤1：获取锁定参数
    // 简化：假设参数是 JSON 格式 {"amount":"...","duration":"..."}
    const amount: u64 = 1000; // 示例金额
    const duration: u64 = 86400; // 示例：锁定24小时（秒）

    // 📍 步骤2：参数验证
    if (amount <= 0 || duration <= 0) {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 📍 步骤3：执行锁定
    const locker = Context.getCaller();
    const unlockTime = Context.getBlockTimestamp() + duration;

    // 💡 在实际实现中，这里会：
    // - 检查用户余额是否足够
    // - 创建锁定UTXO
    // - 设置解锁时间

    // 📍 步骤4：发出锁定事件
    const event = JSON.stringify({
      name: 'AssetLocked',
      locker: this.addressToBase58(locker),
      amount: amount.toString(),
      unlockTime: unlockTime.toString(),
      timestamp: Context.getBlockTimestamp().toString(),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * UnlockAsset 资产解锁功能
   * 
   * 🎯 函数作用：解锁到期的资产
   */
  private unlockAsset(params: Uint8Array): ErrorCode {
    // 📍 步骤1：获取解锁参数
    // 简化：假设参数是 JSON 格式 {"lockID":"..."}
    const lockID: u64 = 1; // 示例

    // 📍 步骤2：检查解锁条件
    const currentTime = Context.getBlockTimestamp();

    // 💡 在实际实现中，这里会：
    // - 查询锁定记录
    // - 检查是否到期
    // - 验证解锁权限
    // - 释放锁定的资产

    // 示例：假设锁定已到期
    const unlocker = Context.getCaller();

    // 📍 步骤3：发出解锁事件
    const event = JSON.stringify({
      name: 'AssetUnlocked',
      unlocker: this.addressToBase58(unlocker),
      lockID: lockID.toString(),
      timestamp: currentTime.toString(),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  // ==================== 功能模块5：游戏逻辑 ====================
  //
  // 🎯 适用场景：游戏合约、互动应用
  // 💡 包含功能：游戏参与、状态管理、奖励分发

  /**
   * PlayGame 游戏参与功能
   * 
   * 🎯 函数作用：用户参与游戏或互动
   * 💡 可以是抽奖、竞猜、技能对战等
   */
  private playGame(params: Uint8Array): ErrorCode {
    // 📍 步骤1：获取游戏参数
    // 简化：假设参数是 JSON 格式 {"gameType":"...","stakeAmount":"..."}
    const gameType = 'lottery'; // 示例
    const stakeAmount: u64 = 100; // 示例

    // 📍 步骤2：参数验证
    if (gameType === '') {
      return ErrorCode.ERROR_INVALID_PARAMS;
    }

    // 📍 步骤3：执行游戏逻辑
    const player = Context.getCaller();
    gameRounds++;

    // 💡 在实际实现中，这里会根据游戏类型实现不同逻辑：
    // - 抽奖：随机数生成，奖励分配
    // - 竞猜：记录答案，等待结果
    // - 对战：匹配对手，执行战斗

    // 示例：简单的运气游戏
    const isWin = (Context.getBlockTimestamp() % 2) === 0; // 简化的随机判断

    let result: string;
    let reward: u64;

    if (isWin) {
      result = 'win';
      reward = stakeAmount * 2; // 赢得双倍奖励
    } else {
      result = 'lose';
      reward = 0;
    }

    // 📍 步骤4：发出游戏事件
    const event = JSON.stringify({
      name: 'GamePlayed',
      player: this.addressToBase58(player),
      gameType: gameType,
      gameRound: gameRounds.toString(),
      result: result,
      reward: reward.toString(),
      timestamp: Context.getBlockTimestamp().toString(),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * GetGameStats 游戏统计查询
   * 
   * 🎯 函数作用：查询游戏的统计信息
   */
  private getGameStats(params: Uint8Array): ErrorCode {
    // 📍 获取查询参数
    const caller = Context.getCaller();
    const player = caller; // 简化：查询调用者

    // 📍 查询游戏统计
    // 💡 在实际实现中，这里会统计用户的游戏历史
    const stats = JSON.stringify({
      player: this.addressToBase58(player),
      totalGames: '10',
      winCount: '6',
      loseCount: '4',
      winRate: '0.6',
      totalReward: '1500',
      lastPlayTime: (Context.getBlockTimestamp() - 3600).toString(), // 1小时前
      timestamp: Context.getBlockTimestamp().toString(),
    });

    const resultBytes = Uint8Array.wrap(String.UTF8.encode(stats));
    HostABI.setReturnData(resultBytes);

    return ErrorCode.SUCCESS;
  }

  // ==================== 查询接口区 ====================
  //
  // 🎯 这里提供各种数据查询功能
  // 💡 查询功能通常不修改状态，只返回信息

  /**
   * GetContractInfo 合约信息查询
   * 
   * 🎯 函数作用：返回合约的基本信息和状态
   */
  private getContractInfo(): ErrorCode {
    // 📍 构建合约信息
    const info = JSON.stringify({
      // 基础信息
      name: CONTRACT_NAME,
      symbol: CONTRACT_SYMBOL,
      version: CONTRACT_VERSION,
      description: CONTRACT_DESCRIPTION,
      author: CONTRACT_AUTHOR,

      // 状态信息
      isInitialized: isInitialized.toString(),
      isPaused: isPaused.toString(),
      totalUsers: totalUsers.toString(),
      totalSupply: totalSupply.toString(),
      proposalCount: proposalCount.toString(),
      gameRounds: gameRounds.toString(),

      // 配置信息
      maxUsers: MAX_USERS.toString(),
      transactionFee: TRANSACTION_FEE.toString(),
      minStakeAmount: MIN_STAKE_AMOUNT.toString(),

      // 支持的功能
      features: [
        '用户管理',
        '资产管理',
        '投票治理',
        '时间锁定',
        '游戏逻辑',
      ],

      // 技术信息
      blockchain: 'WES',
      language: 'TypeScript/AssemblyScript',
      standard: 'Custom Contract',

      // 时间戳
      timestamp: Context.getBlockTimestamp().toString(),
    });

    const resultBytes = Uint8Array.wrap(String.UTF8.encode(info));
    HostABI.setReturnData(resultBytes);

    return ErrorCode.SUCCESS;
  }

  /**
   * GetContractStats 合约统计查询
   * 
   * 🎯 函数作用：返回合约的运行统计数据
   */
  private getContractStats(): ErrorCode {
    // 📍 构建统计信息
    const stats = JSON.stringify({
      totalUsers: totalUsers.toString(),
      totalSupply: totalSupply.toString(),
      totalProposals: proposalCount.toString(),
      totalGameRounds: gameRounds.toString(),
      contractAge: Context.getBlockTimestamp().toString(),
      isActive: (!isPaused).toString(),
      timestamp: Context.getBlockTimestamp().toString(),
    });

    const resultBytes = Uint8Array.wrap(String.UTF8.encode(stats));
    HostABI.setReturnData(resultBytes);

    return ErrorCode.SUCCESS;
  }

  // ==================== 管理功能区 ====================
  //
  // 🎯 这里实现合约的管理和配置功能
  // 🔒 通常只有管理员或特殊权限用户可以调用

  /**
   * PauseContract 暂停合约功能
   * 
   * 🎯 函数作用：紧急暂停合约的所有功能
   * 🔒 只有管理员可以调用
   */
  private pauseContract(): ErrorCode {
    // 📍 权限检查
    const caller = Context.getCaller();
    if (!this.isAdmin(caller)) {
      return ErrorCode.ERROR_UNAUTHORIZED;
    }

    // 📍 暂停合约
    isPaused = true;

    // 📍 发出暂停事件
    const event = JSON.stringify({
      name: 'ContractPaused',
      admin: this.addressToBase58(caller),
      timestamp: Context.getBlockTimestamp().toString(),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  /**
   * ResumeContract 恢复合约功能
   * 
   * 🎯 函数作用：恢复合约的正常功能
   * 🔒 只有管理员可以调用
   */
  private resumeContract(): ErrorCode {
    // 📍 权限检查
    const caller = Context.getCaller();
    if (!this.isAdmin(caller)) {
      return ErrorCode.ERROR_UNAUTHORIZED;
    }

    // 📍 恢复合约
    isPaused = false;

    // 📍 发出恢复事件
    const event = JSON.stringify({
      name: 'ContractResumed',
      admin: this.addressToBase58(caller),
      timestamp: Context.getBlockTimestamp().toString(),
    });
    HostABI.emitEvent(event);

    return ErrorCode.SUCCESS;
  }

  // ==================== 辅助函数区 ====================
  //
  // 💡 这些是帮助主要功能运行的辅助函数

  /**
   * isAdmin 检查是否为管理员
   * 🔒 权限验证函数
   */
  private isAdmin(caller: Uint8Array): bool {
    // 💡 在实际实现中，这里会：
    // - 查询管理员列表
    // - 检查角色权限
    // - 验证多重签名等

    // 简化实现：假设第一个调用者是管理员
    return true; // 示例：总是返回true，实际中需要真实的权限检查
  }

  /**
   * 地址转Base58字符串（辅助方法）
   */
  private addressToBase58(address: Uint8Array): string {
    // 简化实现：实际应使用 HostABI.addressBytesToBase58
    return 'base58_address_placeholder';
  }
}

// 合约实例（单例模式）
const contract = new StarterContract();

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
  const functionName = 'GetContractInfo'; // 示例
  const params = HostABI.getContractInitParams(maxLen);
  if (params === null) {
    return ErrorCode.ERROR_INVALID_PARAMS;
  }
  return contract.onCall(functionName, params);
}

