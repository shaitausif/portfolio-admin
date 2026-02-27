import { AxiosResponse } from "axios";
import { FreeAPISuccessResponseInterface } from "../interfaces/api";
// No LocalStorage import here for authentication purposes. but if needed for any other stuff i can use that as well


// requestHandler: It's a wrapper for your Axios calls to standardize UI feedback (loading, success, error messages) and authentication redirects.
export const requestHandler = async(
    api : () => Promise<AxiosResponse<FreeAPISuccessResponseInterface>>,    
    setLoading : ((loading: boolean) => void) | null,
    onSuccess : (data: FreeAPISuccessResponseInterface) => void,
    onError: (error: string) => void
) => {

    // Showing loading state if the loading function is provided
    setLoading && setLoading(true)
    try {
        const res = await api()
        const { data } = res;
        if(data.success) {
            // Call the onSuccess callback with the response data
            onSuccess(data) 
        }
    } catch (error: any) {
        // Handle error case
      if([401,403].includes(error?.response?.data?.statusCode)){
            // As i am not using localStorage for storing user's information I am using redux store for that that's why i am going to use useDispatch to clear the user if the user found to be unauthorized
        if(isBrowser) window.location.href = '/login'
        }

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Something Went wrong";

      onError(errorMessage)
    } finally {

        setLoading && setLoading(false)
    }
}



export const streamRequestHandler = async (
  api: () => Promise<Response>, // using fetch, not axios
  setLoading: ((loading: boolean) => void) | null,
  onChunk: (chunk: string) => void, // called for each streamed chunk
  onComplete: (finalText: string, id?: string) => void,
  onError: (error: string) => void
) => {
  setLoading && setLoading(true);
  let accumulatedResponse = "";
  let id = ''

  try {
    const res = await api();
    if (!res.body) throw new Error("No response body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) {
    onComplete(accumulatedResponse, id);
    break;
  }

  buffer += decoder.decode(value, { stream: true });

  let boundary;
  while ((boundary = buffer.indexOf("\n\n")) !== -1) {
    const line = buffer.slice(0, boundary).trim();
    buffer = buffer.slice(boundary + 2);

    if (line.startsWith("data: ")) {
      const data = JSON.parse(line.substring(6));
      accumulatedResponse += data.text;
      onChunk(data.text);
    } else if (line.startsWith("end: ")) {
      const data = JSON.parse(line.substring(5));
      id = data._id;
      console.log("Got final id:", id);
    }
  }
}
  } catch (error: any) {
    onError(error?.message || "Something went wrong");
  } finally {
    setLoading && setLoading(false);
  }
};





export const isBrowser = typeof window !== 'undefined'

// A utility function to concatenate CSS class names with proper spacing
export const classNames = (...className: string[]) => {
  // `className.filter(Boolean)`
  // This filters out any values that are "falsy" (like `false`, `null`, `undefined`, `""`, `0`).
  // So, if you pass `classNames("btn", isPrimary && "btn-primary", false, "large")`,
  // it will become `["btn", "btn-primary", "large"]`.
  return className.filter(Boolean).join(" ");
  // `.join(" ")`
  // Joins the remaining strings with a space to form a valid CSS class string.
  // Result: "btn btn-primary large"
};




// A class that provides utility functions for working with local storage
export class LocalStorage {
    // Get a value from local storage by key
    static get(key: string){
        if(!isBrowser) return;
        const value = localStorage.getItem(key)
        if(value){
            try {
                return JSON.parse(value)
            } catch (error) {
                return null
            }
        }
        return null
    }

    // Set a value in local storage by key
    static set(key: string, value: any){
        if(!isBrowser) return 
        localStorage.setItem(key, JSON.stringify(value))
    }

    // Remove a value from local storage by key
    static remove(key: string){
        if(!isBrowser) return;
        localStorage.removeItem(key)
    }


    // Clear all items from localStorage
    static clear(){
        if(!isBrowser) return
        localStorage.clear()
    }

}
export const accessTokenOptions = {
    httpOnly : true, 
    secure : process.env.NODE_ENV === 'production' ? true : false,
    maxAge : 24 * 60 * 60  // 1 day
}

export const refreshTokenOptions = {
    httpOnly : true,
    secure : process.env.NODE_ENV === 'production' ? true : false,
    maxAge : 10 * 24 * 60 * 60 // 10 days
}