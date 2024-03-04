import { useState } from "react";
import Datanav from "./Datanav";

const Navsm = ()=>{
    let [openMenu, setOpen] = useState(false);
    let handleOpenMenu = ()=>{
        setOpen(true)
    }
    let handleCloseMenu = ()=>{
        setOpen(false);
    }
    return(
        <nav className="nav flex spaceBetween alignItem">
            <span className="button__list logo">
                <a href="/blog">LOGO</a>
            </span>
            <button onClick={handleOpenMenu} className="button__list menuIcon">
                <span class="material-symbols-outlined">
                    menu
                </span>
            </button>
            <div className={openMenu ? "activeSideMenu sideMenu" : "sideMenu"}>
                <Datanav width={'50%'} float={'none'} classSize={'links-sm'} classListCate={'list__cate-sm'}/>
                <div onClick={handleCloseMenu} className="links-sm" style={{width: '50%', float: 'right', background: 'unset'}}></div>
            </div>
        </nav>
    )
}

export default Navsm;