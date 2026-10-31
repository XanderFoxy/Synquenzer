set -e
F=/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf
ffmpeg -v error -y -i ui.webm -vf "crop=390:844:0:0,scale=1080:-2:flags=lanczos" -r 30 -c:v libx264 -preset veryfast -crf 14 -an ui30.mp4
ffmpeg -v error -y -i songvideo.webm -r 30 -c:v libx264 -preset veryfast -crf 14 -an sv30.mp4
B=2.142857
# segments: src start dur
SEG=( "u 4.9 1" "s 1 1" "u 13.0 1" "s 3 1" "u 17.0 1" "s 5 1" "u 27.2 1" "u 30.6 2" "u 24.0 1" "s 10 3" "s 13 1.2" )
i=0; L=""
for sg in "${SEG[@]}"; do set -- $sg; src=$1; st=$2; d=$(echo "$3*$B" | bc -l)
 if [ $src = s ]; then st=$(echo "$st*$B" | bc -l); IN=sv30.mp4; VF="scale=1080:1920,setsar=1"
 else IN=ui30.mp4; VF="split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30:2,eq=brightness=-0.25[bg];[b]scale=-2:1920[fg];[bg][fg]overlay=(W-w)/2:0,setsar=1"; fi
 ffmpeg -v error -y -ss $st -i $IN -t $d -filter_complex "$VF" -r 30 -c:v libx264 -preset veryfast -crf 16 -an seg$i.mp4
 L="$L file 'seg$i.mp4'\n"; i=$((i+1)); done
printf "$L" > list.txt
ffmpeg -v error -y -f concat -safe 0 -i list.txt -c copy body.mp4
D=30
T1="Ein ganzer Synthie-Song"; T1b="– nur auf dem iPhone"
TXT="drawtext=fontfile=$F:text='$T1':fontsize=74:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=24:x=(930-tw)/2+20:y=330:enable='lt(t,4.3)',\
drawtext=fontfile=$F:text='$T1b':fontsize=74:fontcolor=0x7CFC6A:box=1:boxcolor=black@0.6:boxborderw=24:x=(930-tw)/2+20:y=450:enable='lt(t,4.3)',\
drawtext=fontfile=$F:text='Gebaut mit KI':fontsize=90:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=26:x=(930-tw)/2+20:y=380:enable='between(t,6.43,10.7)',\
drawtext=fontfile=$F:text='Regler, Clips, Song':fontsize=70:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=22:x=(930-tw)/2+20:y=330:enable='between(t,12.86,19.28)',\
drawtext=fontfile=$F:text='alles im Browser':fontsize=70:fontcolor=0x7CFC6A:box=1:boxcolor=black@0.6:boxborderw=22:x=(930-tw)/2+20:y=445:enable='between(t,12.86,19.28)',\
drawbox=x=0:y=0:w=iw:h=ih:color=black@0.72:t=fill:enable='gte(t,26.9)',\
drawtext=fontfile=$F:text='SYNQUENZER':fontsize=130:fontcolor=0x7CFC6A:x=(930-tw)/2+20:y=800:enable='gte(t,26.9)',\
drawtext=fontfile=$F:text='xanderfoxy.github.io/Synquenzer':fontsize=54:fontcolor=white:x=(930-tw)/2+20:y=980:enable='gte(t,26.9)',\
drawtext=fontfile=$F:text='Synth · Sequencer · Song – gratis':fontsize=46:fontcolor=0xBBBBBB:x=(930-tw)/2+20:y=1080:enable='gte(t,26.9)'"
# audio: measure then normalize
M=$(ffmpeg -hide_banner -i song.wav -t $D -af "afade=t=out:st=28.3:d=1.7,loudnorm=I=-14:TP=-2.3:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
mi=$(echo "$M"|grep input_i|grep -o -- '-\?[0-9.]*'); mtp=$(echo "$M"|grep input_tp|grep -o -- '-\?[0-9.]*'); mlra=$(echo "$M"|grep input_lra|grep -o -- '-\?[0-9.]*'); mth=$(echo "$M"|grep input_thresh|grep -o -- '-\?[0-9.]*'); off=$(echo "$M"|grep target_offset|grep -o -- '-\?[0-9.]*')
ffmpeg -v error -y -i body.mp4 -i song.wav -t $D -filter_complex "[0:v]$TXT,format=yuv420p[v];[1:a]afade=t=out:st=28.3:d=1.7,loudnorm=I=-14:TP=-2.3:LRA=11:measured_I=$mi:measured_TP=$mtp:measured_LRA=$mlra:measured_thresh=$mth:offset=$off:linear=true,aresample=48000[a]" -map "[v]" -map "[a]" -c:v libx264 -profile:v high -preset medium -crf 18 -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart schnell-30s.mp4
