import logoBlack from "../../assets/images/logoBlack.svg";
import logoWhite from "../../assets/images/logoWhite.svg";
import logoColored from "../../assets/images/logoColored.svg"
import darkIcon from "../../assets/images/darkIcon.svg"
import { Link } from "react-router-dom";

const Navbar = () => {
    return ( 
        <nav className="w-screen px-16 py-4 flex flex-row justify-between items-center border-b-slate-400 border">
            <div className="logo">
            <Link to="/dashboard"><img src={logoColored} alt="Logo" className="w-16 md:w-20 hover:scale-105 duration-300"/></Link>
            </div>
            <div className="rightMenu flex flex-row gap-2 md:gap-8 justify-center items-center">
                <img src={darkIcon} alt="Dark Theme" className="cursor-pointer h-10 rounded-full hover:bg-slate-700 p-1 duration-300" />
                <button className="rounded-lg text-slate-700 bg-slate-300 py-2 px-3 hover:bg-slate-700 hover:text-slate-200 duration-300">Sign In</button>    
            </div>
        </nav>
     );
}
 
export default Navbar;