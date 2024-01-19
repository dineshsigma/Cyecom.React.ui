import React from "react";
import { useState } from "react";

function ErrorBoundary ({children}){
    const [hasError, setHasError] = useState(false); 
    const handleOnError = (error, errorInfo) =>
     { 
        console.error(error, errorInfo);
         setHasError(true); 
    }; 
        if (hasError) { 
            return <div>Oops! Something went wrong.</div>;
         } 
        return <>{children} </>;

}
export default ErrorBoundary