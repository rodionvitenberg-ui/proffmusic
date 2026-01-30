import os
from django.utils.deprecation import MiddlewareMixin
from django.core.files.base import ContentFile
from django.http import StreamingHttpResponse

class RangesMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        if response.status_code != 200 or not hasattr(response, 'file_to_stream'):
            return response
            
        http_range = request.META.get('HTTP_RANGE')
        if not (http_range and http_range.startswith('bytes=') and 'content-type' in response.headers):
            return response

        content_type = response.headers['content-type']
        if not content_type.startswith(('video/', 'audio/', 'application/octet-stream')):
            return response

        f = response.file_to_stream
        statobj = os.fstat(f.fileno())
        file_size = statobj.st_size
        
        start, end = http_range.split('=')[1].split('-')
        start = int(start)
        if not end:
            end = file_size - 1
        else:
            end = int(end)

        if start >= file_size:
            return response
            
        f.seek(start)
        chunk_size = 8192
        content_length = end - start + 1
        
        def file_iterator():
            read_bytes = 0
            while read_bytes < content_length:
                bytes_to_read = min(chunk_size, content_length - read_bytes)
                data = f.read(bytes_to_read)
                if not data:
                    break
                read_bytes += len(data)
                yield data

        resp = StreamingHttpResponse(
            file_iterator(),
            status=206,
            content_type=content_type
        )
        resp['Content-Length'] = str(content_length)
        resp['Content-Range'] = f'bytes {start}-{end}/{file_size}'
        resp['Accept-Ranges'] = 'bytes'
        return resp