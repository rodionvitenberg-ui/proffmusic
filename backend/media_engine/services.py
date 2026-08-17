import logging
import os
import subprocess

from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)

def generate_preview(file_path, start_sec=0, duration_sec=30, fade_sec=2):
    """
    Генерирует превью используя системный FFmpeg напрямую.
    Исправлен порядок аргументов для корректной работы фильтров.
    """
    try:
        # Рассчитываем время начала затухания
        fade_out_start = duration_sec - fade_sec
        
        # Формируем команду FFmpeg
        # ВАЖНО: -ss и -t ставим ДО -i. 
        # Это сбрасывает таймштампы в 0, и фильтры работают корректно.
        command = [
            'ffmpeg',
            '-y',             # Перезаписывать
            '-ss', str(start_sec),   # <--- СНАЧАЛА перематываем
            '-t', str(duration_sec), # <--- Ограничиваем длительность
            '-i', file_path,         # <--- ПОТОМ берем файл
            '-vn',            # Убираем видео/обложки (важно для mp3)
            '-ac', '2',       # Форсируем стерео (чтобы не было глюков с каналами)
            '-b:a', '192k',   # Битрейт 192kbps
            '-af', f'afade=t=in:st=0:d={fade_sec},afade=t=out:st={fade_out_start}:d={fade_sec}',
            '-f', 'mp3',      # Формат выхода
            '-'               # Вывод в трубу
        ]

        # Запускаем процесс
        process = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )

        mp3_data = process.stdout
        
        # Проверка на пустоту
        if not mp3_data:
            logger.error("FFmpeg вернул пустой результат!")
            if process.stderr:
                logger.error("FFmpeg stderr: %s", process.stderr.decode('utf-8'))
            return None

        file_name = os.path.basename(file_path)
        preview_name = f"preview_{file_name}"
        
        return ContentFile(mp3_data, name=preview_name)

    except subprocess.CalledProcessError as e:
        error_message = e.stderr.decode('utf-8') if e.stderr else "Unknown FFmpeg error"
        logger.error("FFmpeg critical: %s", error_message)
        return None

    except Exception as e:
        logger.exception("Preview generation error")
        return None
