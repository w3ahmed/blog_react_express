import { useEffect, useState } from "react";

const Datanav = ({width, float, classSize , classListCate})=>{
    let [section, setSection] = useState(JSON.parse(localStorage.getItem('section')))
    let [session, setSession] = useState(null);
  
    let [btnActive, setBtnActive] = useState(null);
    let handleMenuCate = (val)=>{
        setBtnActive(val)
    }
    document.onclick = (e)=>{
      if(e.target.id !== btnActive){
        setBtnActive(null)
      }
    }
    
    useEffect(()=>{
      if(!section){
        fetch('/api/section')
        .then(res => res.json())
        .then(data => setSection(localStorage.setItem('section', JSON.stringify(data))))
        .catch(err => console.log('Error in Url'))
      }
      if(!session){
        fetch('/api/session')
        .then(res => res.json())
        .then(data => setSession(data))
        .catch(err => console.log(err))
      }
      setInterval(()=>{
        fetch('/api/section')
        .then(res => res.json())
        .then(data => setSection(localStorage.setItem('section', JSON.stringify(data))))
      }, 3000000)
    },[section, session])
  
    return(
        <>
            <div className={classSize} style={{width: width}}>
                <span className="button__list logo">
                    <a href="/">LOGO</a>
                </span>
                {section && 
                section.map((ele) => 
                    <span key={ele._id} className="button__list">
                        <button onClick={()=>handleMenuCate(ele._id)} id={ele._id} className="nav__link">{ele.name}</button>
                        <ul className={btnActive === ele._id ? `menuActive ${classListCate}`:`${classListCate}`}>
                            {ele.category_all.map(ele => 
                                <li key={ele._id}> <a href={`/category/${ele._id}`}>{ele.name}</a></li>  
                            )}
                        </ul>
                    </span>
                )}
                {session ? 
                    (<span className="button__list menuProfile" style={{float: float}}>
                        <img src={`/images/${session.img}`} id={session.userid} onClick={()=>handleMenuCate(session.userid)} className="imgMenuProfile" alt='User Img' />
                        <ul className={btnActive === session.userid ? `menuActive ${classListCate} listMenuProfile`:`${classListCate} listMenuProfile`}>
                            <li> <a href={`/profile/${session.userid}`}>Profile</a></li>  
                            <li> <a href={`/addarticle`}>Add Article</a></li>  
                            <li> <a href='/logout'>Log Out</a></li>  
                        </ul>
                    </span>) 
                    :
                    (<span className={classSize === "links-sm" ? "login-sm":"login"} style={{float: float}}>
                        <a href="/login">Login</a>
                    </span>)
                }
            </div>
        </>
    )
}

export default Datanav;