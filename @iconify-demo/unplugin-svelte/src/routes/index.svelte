<script lang="ts">
    // Import from SVG
    import SVGIonAccessibility from 'virtual:icons/svg-ion/accessibility'
    import SVGIonBalloonOutline from 'virtual:icons/svg-ion/balloon-outline'

    // Import as directory
    import SVGAnimatedLoading from 'virtual:icons/svg-animated/loading';
    import SVGAnimatedLoading2 from 'virtual:icons/svg-animated/loading2';

</script>

<main>
    <section>
        <h1>Importing from 512x512 monotone SVG (imported one by one on demand)</h1>
        <p>Black 1em icon, changes color on hover: <SVGIonAccessibility /></p>
        <p>Green 2em icon: <SVGIonBalloonOutline style="font-size: 2em; color: #327335;"/></p>    
    </section>

    <section>
        <h1>Importing from 24x24 animated monotone SVG (imported as icon set from directory)</h1>
        <p class="animated24">
            <SVGAnimatedLoading />
            <SVGAnimatedLoading2 />
        </p>
    </section>
</main>

<style>
    main {
        text-align: left;
        font-size: 16px;
        line-height: 24px;
    }
    section {
        border: 1px solid #ccc;
        background: #f2f2f2;
        color: #313131;
        margin: 8px;
        padding: 8px;
        transition: color 0.2s ease;
    }
    section:hover p {
        color: #ba3329;
    }

    section h1 {
        font-size: 24px;
        line-height: 32px;
        margin: 0 0 16px;
        padding: 0;
    }

    .animated24 {
        font-size: 24px;
        line-height: 1em;
        color: #026c9c;
    }

    p {
        margin: 8px 0;
        padding: 0;
    }
</style>
