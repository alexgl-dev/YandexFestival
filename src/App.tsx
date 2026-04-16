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
import { ManagementLayout } from './pages/management/ManagementLayout';
import { ManagementMenu } from './pages/management/ManagementMenu';
import { Description as MgmtDescription } from './pages/management/Description';
import { Profession as MgmtProfession } from './pages/management/Profession';
import { TaskList as MgmtTaskList } from './pages/management/TaskList';
import { TaskPage as MgmtTaskPage } from './pages/management/TaskPage';
import { Videos as MgmtVideos } from './pages/management/Videos';
import { Test as MgmtTest } from './pages/management/Test';
import { DataLayout } from './pages/data/DataLayout';
import { DataMenu } from './pages/data/DataMenu';
import { Description as DataDescription } from './pages/data/Description';
import { Profession as DataProfession } from './pages/data/Profession';
import { TaskList as DataTaskList } from './pages/data/TaskList';
import { TaskPage as DataTaskPage } from './pages/data/TaskPage';
import { Videos as DataVideos } from './pages/data/Videos';
import { Test as DataTest } from './pages/data/Test';
import { CalendarsLayout } from './pages/calendars/CalendarsLayout';
import { CalendarsMenu } from './pages/calendars/CalendarsMenu';
import { CalendarView } from './pages/calendars/CalendarView';

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
        <Route path="/management" element={<ManagementLayout />}>
          <Route index element={<ManagementMenu />} />
          <Route path="description" element={<MgmtDescription />} />
          <Route path="description/:professionId" element={<MgmtProfession />} />
          <Route path="tasks" element={<MgmtTaskList />} />
          <Route path="tasks/:taskId" element={<MgmtTaskPage />} />
          <Route path="videos" element={<MgmtVideos />} />
          <Route path="test" element={<MgmtTest />} />
        </Route>
        <Route path="/data" element={<DataLayout />}>
          <Route index element={<DataMenu />} />
          <Route path="description" element={<DataDescription />} />
          <Route path="description/:professionId" element={<DataProfession />} />
          <Route path="tasks" element={<DataTaskList />} />
          <Route path="tasks/:taskId" element={<DataTaskPage />} />
          <Route path="videos" element={<DataVideos />} />
          <Route path="test" element={<DataTest />} />
        </Route>
        <Route path="/calendars" element={<CalendarsLayout />}>
          <Route index element={<CalendarsMenu />} />
          <Route path=":section" element={<CalendarView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
