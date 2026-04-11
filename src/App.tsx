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
import { DevelopmentLayout } from './pages/development/DevelopmentLayout';
import { DevelopmentMenu } from './pages/development/DevelopmentMenu';
import { Description as DevDescription } from './pages/development/Description';
import { Profession as DevProfession } from './pages/development/Profession';
import { TaskList as DevTaskList } from './pages/development/TaskList';
import { TaskPage as DevTaskPage } from './pages/development/TaskPage';
import { Videos as DevVideos } from './pages/development/Videos';
import { Test as DevTest } from './pages/development/Test';

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
        <Route path="/development" element={<DevelopmentLayout />}>
          <Route index element={<DevelopmentMenu />} />
          <Route path="description" element={<DevDescription />} />
          <Route path="description/:professionId" element={<DevProfession />} />
          <Route path="tasks" element={<DevTaskList />} />
          <Route path="tasks/:taskId" element={<DevTaskPage />} />
          <Route path="videos" element={<DevVideos />} />
          <Route path="test" element={<DevTest />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
