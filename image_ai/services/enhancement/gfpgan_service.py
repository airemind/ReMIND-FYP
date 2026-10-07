import subprocess
import os
import sys


def run_gfpgan(input_folder="inputs", output_folder="results"):

    # GFPGAN location
    BASE_DIR = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../ai_models/gfpgan")
    )

    script_path = os.path.join(BASE_DIR, "inference_gfpgan.py")

    input_folder = os.path.abspath(input_folder)

    output_folder = os.path.abspath(output_folder)

    command = [
        sys.executable,
        script_path,
        "-i",
        input_folder,
        "-o",
        output_folder,
        "-v",
        "1.3",
        "--bg_upsampler",
        "realesrgan",
    ]

    try:

        print("Running GFPGAN...")

        subprocess.run(command, cwd=BASE_DIR, check=True)

        print("GFPGAN completed")

    except subprocess.CalledProcessError as e:

        print("Error running GFPGAN:", e)

        raise Exception("GFPGAN enhancement failed")


if __name__ == "__main__":

    run_gfpgan()
