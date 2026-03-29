import UserAvatar from './components/UserAvatar';
import ChatWindow from './components/ChatWindow';
import InputArea from './components/InputArea';
import './App.css';

function App() {
  const handleQuickActionSelect = (action) => {
    console.log('Selected quick action:', action.text);
    // TODO: 后续实现 AI 对话功能
  };

  const handleSendMessage = (message) => {
    console.log('User sent message:', message);
    // TODO: 后续实现 AI 对话功能
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <UserAvatar />
          <h1 className="app-title">智聘鼠</h1>
        </div>
        <nav className="header-nav">
          <a href="#" className="nav-item">校招</a>
          <a href="#" className="nav-item">简历</a>
          <div className="nav-dots">
            <span>•••</span>
          </div>
        </nav>
      </header>

      <main className="app-main">
        <ChatWindow onQuickActionSelect={handleQuickActionSelect} />
      </main>

      <footer className="app-footer">
        <InputArea onSend={handleSendMessage} />
      </footer>
    </div>
  );
}

export default App;
