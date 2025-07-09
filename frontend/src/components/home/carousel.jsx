import React, { useState, useEffect } from 'react';

function Carousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = 2;

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const previousSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full max-w-full overflow-hidden">
            <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {/* Slide 1 */}
                <div className="slide block w-full h-[700px] relative bg-cover bg-center flex-shrink-0" style={{ backgroundImage: "url('images/Landing A/Visuel.png')" }}>
                    <section className="w-full h-[700px] mx-auto overflow-hidden relative flex flex-col justify-between">
                        <div className="flex flex-row h-full">
                            <div className="flex flex-col justify-start items-start flex-[1.2] pl-16 pt-16">
                                <img src="images/Landing A/Logo-gustave-roussy@2x.png" alt="Gustave Roussy Logo" className="w-56 h-auto mb-4 filter brightness-0 invert" />
                                <h2 className="text-4xl font-bold leading-tight text-white uppercase text-left font-sans mb-0 mt-8">À 30 ANS,<br />TOUT COMMENCE.</h2>
                            </div>
                            <div className="flex flex-col items-end flex-1 pr-16 pt-10">
                                <button className="bg-pink-600 text-white rounded-full px-8 py-3 text-base font-semibold mb-8 shadow-md hover:bg-pink-800 flex items-center donation-button">
                                    <img src="images/Landing A/picto coeur.svg" alt="Heart" className="w-5 h-5 mr-2" /> 
                                    JE FAIS UN DON
                                </button>
                                <div className="flex flex-col items-end mt-8">
                                    <button className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg mb-2 play-button">
                                        <svg className="w-10 h-10 text-[#00ACA8]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </button>
                                    <span className="text-white text-xs font-semibold">VOIR LA VIDÉO</span>
                                    <a href="#" className="text-[#00ACA8] text-sm font-semibold leading-tight text-right mt-1">AXELLE, 26 ANS<br />EN JUIN 2021</a>
                                </div>
                            </div>
                        </div>
                        <div className="absolute left-0 right-0 bottom-0 w-full flex flex-col items-center">
                            <div className="flex flex-row justify-center items-center gap-6 donation-bar px-8 py-6 w-full">
                                <button className="w-52 h-20 bg-white text-pink-300 rounded-2xl text-2xl font-bold uppercase flex items-center justify-center transition-all amount-button">80€</button>
                                <button className="w-52 h-20 bg-pink-600 text-white rounded-2xl text-2xl font-bold uppercase flex items-center justify-center shadow-md transition-all amount-button">150€</button>
                                <button className="w-52 h-20 bg-white text-pink-300 rounded-2xl text-2xl font-bold uppercase flex items-center justify-center transition-all amount-button">200€</button>
                                <button className="w-52 h-20 bg-white text-pink-600 font-bold rounded-2xl text-2xl uppercase flex items-center justify-center transition-all amount-button">MONTANT LIBRE</button>
                                <button className="w-80 h-20 bg-pink-600 text-white rounded-2xl text-lg font-bold uppercase flex items-center justify-center shadow-md ml-4 transition-colors donation-button">
                                    <img src="images/Landing A/picto coeur.svg" alt="Heart" className="w-5 h-5 mr-2" /> 
                                    JE FAIS UN DON PONCTUEL
                                </button>
                                <button className="w-80 h-20 bg-white text-pink-700 rounded-2xl text-lg font-bold uppercase flex items-center justify-center shadow-md ml-4 transition-colors donation-button">JE PRÉFÈRE FAIRE UN DON RÉGULIER</button>
                            </div>
                            <div className="w-full donation-bar text-center py-2">
                                <span className="text-white text-lg font-normal">Soit <b className="font-bold">51€</b> après déduction fiscale</span>
                            </div>
                        </div>
                    </section>
                </div>
                
                {/* Slide 2 */}
                <div className="slide w-full h-[700px] relative bg-cover bg-center flex-shrink-0" style={{ backgroundImage: "url('images/Landing B/Visuel.png')" }}>
                    <section className="w-full h-[700px] mx-auto overflow-hidden relative">
                        <div className="flex flex-row relative bg-black/20 min-h-full w-full h-full">
                            <div className="flex-[1.2] text-white p-10 pt-10 flex flex-col justify-start">
                                <div className="mb-6">
                                    <img src="images/Landing A/Logo-gustave-roussy@2x.png" alt="Gustave Roussy Logo" className="w-44 h-auto mb-2 filter brightness-0 invert" />
                                </div>
                                <div className="mt-10">
                                    <h2 className="text-3xl font-bold leading-tight text-white uppercase text-left font-sans">À 30 ANS,<br />TOUT COMMENCE.<br /><span className="block mt-2 text-white font-bold uppercase">QUAND POUR D'AUTRES,<br />TOUT BASCULE.</span></h2>
                                </div>
                                <div className="mt-6 text-white text-base font-normal">
                                    <span className="text-[#00ACA8] font-bold text-base">+79 %</span> de cas de cancer chez les jeunes adultes.<br />
                                    Accélérez la recherche pour les générations de demain :<br />
                                    <span className="text-[#00ACA8] font-bold uppercase underline cursor-pointer">FAITES UN DON.</span>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col items-end justify-start p-8 pt-8">
                                <button className="bg-pink-600 text-white rounded-full px-7 py-3 text-base font-semibold mb-8 shadow-md hover:bg-pink-800 flex items-center donation-button">
                                    <img src="images/Landing A/picto coeur.svg" alt="Heart" className="w-5 h-5 mr-2" /> 
                                    JE FAIS UN DON
                                </button>
                                <div className="flex items-center mt-10">
                                    <button className="bg-white text-pink-600 rounded-full w-12 h-12 text-2xl mr-3 shadow-md flex items-center justify-center play-button">
                                        <svg className="w-10 h-10 text-[#00ACA8]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </button>
                                    <div className="flex flex-col">
                                        <span className="text-white text-sm mb-0.5">VOIR LA VIDÉO</span>
                                        <a href="#" className="text-[#00ACA8] text-sm font-semibold leading-tight">AXELLE, 29 ANS<br />AOÛT 2024</a>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute left-0 right-0 bottom-0 donation-bar flex flex-col px-4 pt-6 pb-0 gap-2">
                                <div className="flex flex-col w-full">
                                    <div className="flex flex-row items-center justify-between w-full gap-6">
                                        <button className="bg-white text-pink-600 rounded-l-2xl w-72 h-[79px] text-lg font-bold uppercase flex items-center justify-start pl-8 shadow-md mr-2 transition-colors donation-button">JE PRÉFÈRE FAIRE UN DON PONCTUEL</button>
                                        <div className="flex flex-row items-center justify-center gap-6 flex-1">
                                            <button className="bg-pink-600 text-white rounded-2xl w-[211px] h-[79px] text-2xl font-bold uppercase shadow-md flex items-center justify-center transition-all amount-button">10€</button>
                                            <button className="bg-white text-pink-300 rounded-2xl w-[211px] h-[79px] text-2xl font-bold uppercase opacity-35 flex items-center justify-center transition-all amount-button">15€</button>
                                            <button className="bg-white text-pink-300 rounded-2xl w-[211px] h-[79px] text-2xl font-bold uppercase opacity-35 flex items-center justify-center transition-all amount-button">20€</button>
                                            <button className="bg-white text-pink-600 font-bold opacity-80 rounded-2xl w-[211px] h-[79px] text-2xl uppercase flex items-center justify-center transition-all amount-button">Montant libre</button>
                                        </div>
                                        <button className="bg-pink-600 text-white rounded-2xl w-80 h-[79px] text-lg font-bold uppercase flex items-center justify-center shadow-md ml-2 transition-colors donation-button">
                                            <img src="images/Landing A/picto coeur.svg" alt="Heart" className="w-5 h-5 mr-2" /> 
                                            JE FAIS UN DON RÉGULIER
                                        </button>
                                    </div>
                                    <div className="w-full text-center mt-2 text-lg text-white font-normal">Soit <b className="font-bold">3,40€</b> après déduction fiscale</div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            
            <button className="absolute top-1/2 left-8 transform -translate-y-1/2 bg-gray-900/70 text-white border-none text-4xl rounded-full w-14 h-14 flex items-center justify-center cursor-pointer z-20 transition-colors shadow-lg nav-arrow hover:bg-pink-600/80" onClick={previousSlide}>&#10094;</button>
            <button className="absolute top-1/2 right-8 transform -translate-y-1/2 bg-gray-900/70 text-white border-none text-4xl rounded-full w-14 h-14 flex items-center justify-center cursor-pointer z-20 transition-colors shadow-lg nav-arrow hover:bg-pink-600/80" onClick={nextSlide}>&#10095;</button>
        </div>
    );
}

export default Carousel;