import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import Home from '@/pages/Home';
import PlayMachine from '@/pages/PlayMachine';
import ClassroomTeacher from '@/pages/ClassroomTeacher';
import ClassroomStudent from '@/pages/ClassroomStudent';

// Versão independente (GitHub Pages): sem login, tudo roda no navegador.
export default function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jogar/maquina" element={<PlayMachine />} />
          <Route path="/sala/professor" element={<ClassroomTeacher />} />
          <Route path="/sala/aluno" element={<ClassroomStudent />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}
