import { BrowserRouter, Routes, Route } from 'react-router';
import { HomePage } from './pages/HomePage/HomePage';
import { TestScreen } from './pages/TestScreen/TestScreen';
import { CreativeLayout } from './pages/creative/CreativeLayout';
import { CreativeMenu } from './pages/creative/CreativeMenu';
import { Description } from './pages/creative/Description';
import { Profession } from './pages/creative/Profession';
import { TaskList } from './pages/creative/TaskList';
import { TaskPage } from './pages/creative/TaskPage';
import { Videos } from './pages/creative/Videos';
import { Test } from './pages/creative/Test';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ui-kit" element={<TestScreen />} />
        <Route path="/creative" element={<CreativeLayout />}>
          <Route index element={<CreativeMenu />} />
          <Route path="description" element={<Description />} />
          <Route path="description/:professionId" element={<Profession />} />
          <Route path="tasks" element={<TaskList />} />
          <Route path="tasks/:taskId" element={<TaskPage />} />
          <Route path="videos" element={<Videos />} />
          <Route path="test" element={<Test />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
