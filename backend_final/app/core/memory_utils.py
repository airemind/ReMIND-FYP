import ctypes
import gc


def release_system_memory():
    """
    Force Python garbage collection and tell Linux glibc to release
    freed memory back to the OS kernel immediately.
    Keeps memory usage low on Render Free Tier (512MB).
    """
    gc.collect()
    try:
        libc = ctypes.CDLL("libc.so.6")
        libc.malloc_trim(0)
    except Exception:
        pass

