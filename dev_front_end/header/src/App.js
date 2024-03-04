import Navlg from "./components/Navlg";
import Navsm from "./components/Navsm";
function App() {
  return (
    <header className="head">
      <div className="sm-d-none md-d-block">
        <Navlg />
      </div>
      <div className="md-d-none">
        <Navsm />
      </div>
    </header>

  );
}

export default App;
