interface checkAccessProps{
    auth ?: { [key: string]: any },
    route: string
}

const checkAccess = ({auth, route}: checkAccessProps)=>{
    if(!auth){
        return false;
    }

    const isSuperAdmin = auth.isSuper;
    const isSupervisor = auth.isSupervisor;
    const permittedRoutes = auth.allowedroutes || [];

    // Supervisors can access all routes except supervisor
    if(isSupervisor && route !== 'supervisor'){
        return true;
    }

    if(isSuperAdmin || permittedRoutes.includes(route)){
        return true;
    }

    return false;
}

export default checkAccess;