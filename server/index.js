// 后端启动入口：初始化 store（加载种子/持久化），启动 HTTP 服务
import { init } from './store.js';
import { createApp } from './app.js';

const PORT = process.env.PORT || 8078;

init();
const app = createApp();
app.listen(PORT, () => {
  console.log(`data-resource-platform API listening on :${PORT}`);
});
