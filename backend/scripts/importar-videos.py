from pathlib import Path
import csv
import mimetypes

RAIZ = Path(__file__).resolve().parents[2]
PASTA_VIDEOS = RAIZ / "frontend/public/videos"
DESTINO = Path("/tmp/ediagnostico_videos.csv")

videos = sorted(
    arquivo
    for arquivo in PASTA_VIDEOS.rglob("*")
    if arquivo.is_file() and arquivo.suffix.lower() == ".mp4"
)

with DESTINO.open("w", newline="", encoding="utf-8") as arquivo_csv:
    escritor = csv.writer(arquivo_csv)

    for video in videos:
        caminho = "/videos/" + video.relative_to(PASTA_VIDEOS).as_posix()

        escritor.writerow([
            video.stem,
            "video",
            caminho,
            mimetypes.guess_type(video.name)[0] or "video/mp4",
            video.stat().st_size,
            "Videoaulas",
        ])

print(f"Vídeos encontrados: {len(videos)}")
print(f"Arquivo de importação: {DESTINO}")
