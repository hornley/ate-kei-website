import uvicorn
import webbrowser
import threading
import time

def open_browser():
    time.sleep(2)
    webbrowser.open('http://127.0.0.1:8000')

if __name__ == "__main__":
    # Start browser in background thread
    browser_thread = threading.Thread(target=open_browser, daemon=True)
    browser_thread.start()
    
    # Start the FastAPI server
    print("Starting Lotto Encoding Server...")
    print("Server will open in your browser automatically.")
    print("Press Ctrl+C to stop the server.")
    
    uvicorn.run("app:app", host="127.0.0.1", port=8000, log_level="info", reload=True)
