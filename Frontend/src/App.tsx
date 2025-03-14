import { Route, Routes } from 'react-router';

// pages
import Home from './pages/Home';
import Conversation from './pages/Conversation';
import Graph from './pages/Graph/Graph';
import Upload from './pages/Upload';

// layouts
import ChatHistory from './layouts/ChatHistory';
import ChatExtension from './layouts/ChatExtension';

function App() {
  return (
    <Routes>
      <Route element={<ChatHistory />}>
        <Route path="conversation/:conversationId/extension" element={<ChatExtension />}>
          <Route path="graph/:message_index" element={<Graph />} />
        </Route>
        <Route path="" element={<Home />} />
        <Route path="conversation/:conversationId" element={<Conversation />} />
        <Route path="upload" element={<Upload />} />
      </Route>
    </Routes>
  );
}

export default App;
