f=$1
ffprobe -v error -show_entries stream=codec_name,width,height,duration,r_frame_rate:format=duration -of compact=p=0 $f
ffmpeg -hide_banner -i $f -af ebur128=peak=true -f null - 2>&1 | grep -A14 Summary | grep -E "I:|Peak:" | tr -s ' '
