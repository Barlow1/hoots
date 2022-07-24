import MainContainer from "../container";

interface AppProps {
  children: React.ReactNode;
}

const App = ({ children }: AppProps) => {
  return <MainContainer>{children}</MainContainer>;
};

export default App;
