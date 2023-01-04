for x in $1/*.png; do
    echo $x
    rm "${x%.*}-bp.png"
    python3.10 gen_blueprint.py $x "${x%.*}-bp.png"
done