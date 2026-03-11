export const vaultAbi = [
  "function deposit(address token, uint256 amount) external",
  "function depositBNB() external payable",
  "function withdraw(address token, uint256 amount) external",
  "function setAgent(address agent, bool status) external",
  "function executeTrade(address user, address router, address tokenIn, address tokenOut, uint256 amountIn, bytes calldata routerData) external",
  "function getUserBalance(address user, address token) external view returns (uint256)",
  "function getUserBNBBalance(address user) external view returns (uint256)",
  "function isAgentAuthorized(address user, address agent) external view returns (bool)",
  "function getUserBalances(address user, address[] calldata tokens) external view returns (uint256[])",
  "event Deposited(address indexed user, address indexed token, uint256 amount)",
  "event Withdrawn(address indexed user, address indexed token, uint256 netAmount, uint256 fee)",
  "event AgentAuthorized(address indexed user, address indexed agent, bool status)",
  "event TradeExecuted(address indexed user, address indexed agent, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut)"
];
