export default {
    storyRewards: {
        reward_freeplay: {
            title: "Freeplay",
            description: `You did it! You unlocked the <strong>free-play mode</strong>! This means that shapes are now <strong>randomly</strong> generated!<br><br>
            Since the hub will require a <strong>throughput</strong> from now on, You'll be guided through building a machine that can <strong>automatically</strong> produce the required shapes.<br><br>
            The HUB outputs the requested shape on the wires layer. For the next set of levels, the hub will request a basic shape - One of full squares, full stars, full circles and full windmills.<br><br>
            You can use FILTERS to pick whichever shape is needed.`
        },
        chapter_paint: {
            title: "Painting",
            description: `Shapes will now need to be painted. You can use the <strong>ANALYZER</strong> to detect the shape and <strong>PAINT</strong> it to the desired color.<br><br>
            A single <strong>DOUBLE PAINTER</strong> will produce the required throughput.<br><br>
            If you place FILTERS between the painter and the selector, you can flush out parts from the previous level, making your machine <strong>FASTER</strong>.
            `
        },
        chapter_uncolored: {
            title: "Uncolored Shapes",
            description: `Sometimes, shapes will need to remain uncolored. You can use the <strong>COMPARER</strong> to detect whether a shape needs to be uncolored, and bypass the painter if it does.<br><br>`
        },
        chapter_halves: {
            title: "Half Shapes",
            description: `You'll now need to produce the <strong>RIGHT HALF</strong> of a shape, at double the throughput. You'll want to flush out older shapes before cutting them in half.<br><br>
            To produce the <strong>SIGNAL</strong> for a desired shape, you can use the <strong>VIRTUAL PAINTER</strong> to produce the shape's signal.`
        },
        chapter_quarters: {
            title: "Quarter Shapes",
            description: `You'll now need to produce the <strong>TOP RIGHT QUARTER</strong> of a shape, at double the throughput again. You'll want to flush out older shapes before cutting them up.<br><br>
            The <strong>VIRTUAL CUTTER</strong> can be used to produce the shape's signal.
        `
        },
        chapter_double_quarters: {
            title: "Double Quarter Shapes",
            description: `The hub will now request a shape made of <strong>TWO QUARTERS</strong>. You'll want to copy the module you just built, and place it next to the original.<br><br>
            You can use <strong>STORAGES</strong> to cache the colours `
        }
    }
};
