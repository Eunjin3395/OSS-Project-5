import LoginPage from "./components/views/LoginPage";
import ChattingPage from "./components/views/ChattingPage";
import { Routes, Route, BrowserRouter } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/chat' element={<ChattingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
