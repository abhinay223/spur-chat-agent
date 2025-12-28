import { ChatWidget } from './components/ChatWidget';

function App() {
  return (
    <div className="w-screen h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-6xl h-[95vh] mx-4">
        <ChatWidget />
      </div>
    </div>
  );
}

export default App;
