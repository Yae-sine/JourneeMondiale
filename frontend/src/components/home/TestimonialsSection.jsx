import React, { useState } from 'react';

function TestimonialsSection() {
    const testimonials = [
        {
            img: 'images/Landing A/Photo Emilie 3.png',
            label: 'ÉMILIE T, 40 ANS, TOUCHÉE PAR UN CANCER DU CÔLON MÉTASTATIQUE',
            quote: "Tout va très vite, je suis passée de l'autre côté de la barrière.",
            text: `« Une prise de sang de routine révèle que mon taux de fer est bas. Rien d'alarmant, je prends des comprimés, mais mes analyses restent inchangées. Je dois faire une coloscopie et une fibroscopie que je repousse. Presque un an après mes analyses, je fais ces examens et le diagnostic tombe : j'ai un cancer du côlon métastatique de stade 4 à 39 ans. Je suis suivie à Gustave Roussy par le Dr Cristina Smolenschi qui me parle des traitements et des nouvelles recherches sur ce cancer. Je savais que j'étais au bon endroit. Mon protocole comprend 4 séances de chimiothérapie puis une opération des métastases hépatiques et du côlon. Je ne sais plus si j'ai eu peur. J'ai surtout pensé à mes enfants de 14 et 10 ans, et à mes parents. Je ne connais pas mon avenir, mais j'ai espoir et c'est grâce aux dons et à la recherche. »`,
            thumb: 'images/Landing A/Photo Emilie 3.png',
        },
        {
            img: 'images/Landing A/medium-shot-woman-with-delicious-food.png',
            label: 'AXELLE D, 29 ANS TOUCHÉE PAR UN CANCER DU SEIN',
            quote: "Je pleure, je pense immédiatement à mes enfants de 13 et 8 ans.",
            text: `« Au cours du premier trimestre de grossesse, mon médecin me soigne pour une gastro-entérite. Les symptômes ne passant pas, mon mari m'emmène aux urgences. On m'annonce que j'ai une occlusion intestinale. Après l'opération, d'autres examens sont réalisés : <span class='font-bold'>j'ai un cancer du côlon métastasé au foie.</span> J'ai 39 ans et une bonne hygiène de vie : <span class='font-bold'>j'ai les jambes sciées.</span> Mon dossier est transféré à Gustave Roussy et je suis reçue par le Dr Cristina Smolenschi. Elle me dit que l'on va me traiter et <span class='font-bold'>ce sera sans séquelle pour mon bébé.</span> J'ai eu 11 séances de chimiothérapie et <span class='font-bold'>j'ai pu profiter de ma grossesse !</span> Après l'accouchement de mon fils, j'ai été opérée et j'ai pris une chimiothérapie orale. J'ai quelques séquelles neurologiques, mais j'ai la chance d'avoir pu être soignée. <span class='font-bold'>Le cancer peut toucher n'importe qui, il faut faire progresser la recherche.</span> »`,
            thumb: 'images/Landing A/medium-shot-woman-with-delicious-food.png',
        },
        {
            img: 'images/Landing A/unnamed.png',
            label: 'ZAHIA B, 42 ANS TOUCHÉE PAR UN CANCER DU CÔLON',
            quote: "J'ai retrouvé l'espoir grâce à la recherche.",
            text: `« Après des mois de fatigue et de douleurs abdominales, le diagnostic tombe : cancer du côlon. Grâce à la recherche et à l'équipe médicale, j'ai pu bénéficier d'un traitement innovant qui m'a permis de retrouver une vie normale. Merci à tous les donateurs ! »`,
            thumb: 'images/Landing A/unnamed.png',
        },
    ];

    const [currentTestimonial, setCurrentTestimonial] = useState(1);

    const setTestimonial = (index) => {
        setCurrentTestimonial(index);
    };

    return (
        <section id="testimonials" className="w-full py-12 bg-gray-50">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                {/* Left Column: Heading, intro, thumbnails */}
                <div className="flex flex-col items-start bg-white rounded-2xl p-6 shadow-md h-full">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight mb-2">
                        LEUR VIE A BASCULÉ...<br />
                        <span className="text-[#00ACA8]">MAIS LA RECHERCHE LEUR A SAUVÉ LA VIE !</span>
                    </h2>
                    <p className="text-gray-600 mb-4">
                        « Un cancer à 30 ans » est un espoir pour ces patients, leur famille, mais aussi pour les générations futures. 
                        Ne laissons pas le cancer donner un coup d'arrêt à leurs projets !
                    </p>
                    <div className="w-full flex flex-col items-center mb-2">
                        <div className="w-full flex items-center justify-center mb-2">
                            <div className="flex-1 border-t-2 border-[#00ACA8]"></div>
                            <span className="mx-2 text-[#00ACA8] font-bold text-sm uppercase tracking-wide">
                                VOIR LES AUTRES TÉMOIGNAGES
                            </span>
                            <div className="flex-1 border-t-2 border-[#00ACA8]"></div>
                        </div>
                        <div className="flex flex-row gap-2 w-full justify-center">
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className="relative cursor-pointer group"
                                    onClick={() => setTestimonial(index)}
                                >
                                    <img
                                        src={testimonial.thumb}
                                        alt={testimonial.label}
                                        className="rounded-[20px] w-20 h-20 object-cover border-2 border-[#00ACA8] group-hover:opacity-80 transition"
                                    />
                                    <div className="absolute bottom-2 left-1 right-1 bg-[#00ACA8] bg-opacity-90 text-white text-xs font-bold px-2 py-1 rounded">
                                        {testimonial.label.split(',')[0]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center Column: Main Testimonial Image */}
                <div className="flex flex-col items-center justify-center">
                    <div className="relative w-72 h-72 md:w-80 md:h-80">
                        <img
                            src={testimonials[currentTestimonial].img}
                            alt="Témoignage"
                            className="rounded-2xl w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4 bg-[#00ACA8] bg-opacity-90 text-white font-bold px-3 py-2 rounded">
                            <span>{testimonials[currentTestimonial].label}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Main Testimonial Text */}
                <div className="flex flex-col justify-center h-full">
                    <div className="flex items-center mb-2">
                        <svg className="w-8 h-8 text-[#00ACA8] mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6M9 5a7 7 0 0 0 7 7v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a7 7 0 0 0 7-7z"/>
                        </svg>
                        <span className="text-[#00ACA8] text-2xl md:text-3xl font-bold leading-tight">
                            {testimonials[currentTestimonial].quote}
                        </span>
                    </div>
                    <p
                        className="text-gray-700 text-base md:text-lg leading-relaxed font-normal"
                        dangerouslySetInnerHTML={{ __html: testimonials[currentTestimonial].text }}
                    />
                </div>
            </div>
        </section>
    );
}

export default TestimonialsSection;
