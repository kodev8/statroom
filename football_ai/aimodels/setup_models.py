import gdown
from pathlib import Path


def download_models():
    ROOT_DIR = Path(__file__).resolve().parent.parent

    if not (ROOT_DIR / 'aimodels').exists():
        (ROOT_DIR / 'aimodels').mkdir()
    else:
        print("'aimodel' directory already exists.")

    model_files = { 
        'football-ball-detection.pt': '1isw4wx-MK9h9LMr36VvIWlJD6ppUvw7V',
        'football-player-detection.pt': '17PXFNlx-jI7VjVo_vQnB1sONjRyvoB-',
        'football-pitch-detection.pt': '1Ma5Kt86tgpdjCTKfum79YMgNnSjcoOyf'
    }

    for model_file, model_id in model_files.items():
        if not (ROOT_DIR / 'aimodels' / model_file).exists():
            print(f"Downloading model: {model_file}")
            gdown.download(f'https://drive.google.com/uc?id={model_id}', str(ROOT_DIR / 'aimodels' / model_file))
        else:
            print(f"Model: {model_file} already exists.")

    print("Models downloaded successfully.")


if __name__ == "__main__":
    try: 
        download_models()
    except Exception as e:
        print(f"Error: {e}")