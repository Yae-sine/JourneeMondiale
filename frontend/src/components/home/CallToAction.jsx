import React from 'react';

function CallToAction() {
    return (
        <section className="w-full py-10 px-2 md:px-0 bg-[#00ACA8]">
            <div className="max-w-6xl mx-auto flex md:flex-row items-center md:items-stretch gap-8">
                
                <div className="flex-1 flex flex-col justify-center items-start md:pl-8">
                    <h2 className="uppercase text-white font-bold text-3xl md:text-4xl leading-tight tracking-wide mb-2">
                        C'EST PAR LE DON
                    </h2>
                    <h3 className="uppercase text-white font-normal text-2xl md:text-3xl leading-tight tracking-wide mb-6">
                        QUE TOUT COMMENCE !
                    </h3>
                    <div className="flex flex-row gap-4 mb-2">
                        <button className="bg-pink-600 text-white rounded-full px-8 py-3 text-base font-semibold mb-8 shadow-md hover:bg-pink-800 flex items-center donation-button">
                            <img src="images/Landing A/picto coeur.svg" alt="Heart" className="w-5 h-5 mr-2" /> JE FAIS UN DON RÉGULIER
                        </button>
                        <button className="bg-pink-600 text-white rounded-full px-8 py-3 text-base font-semibold mb-8 shadow-md hover:bg-pink-800 flex items-center donation-button">
                            <img src="images/Landing A/picto coeur.svg" alt="Heart" className="w-5 h-5 mr-2" /> JE FAIS UN DON PONCTUEL
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-center items-start md:items-center">
                    <p className="text-white text-base md:text-[17px] leading-snug md:leading-normal">
                        Les fonds privés, issus de la générosité de nos donateurs, constituent <span className="font-bold">notre principale ressource pour financer la recherche.</span><br />
                        Grâce à sa régularité, le prélèvement automatique permet aux équipes de lancer des recherches exploratoires et générer des données préliminaires, indispensables pour trouver de nouvelles voies thérapeutiques<br className="hidden md:block" /> contre le cancer.
                    </p>
                </div>
            </div>
        </section>
    );
}

export default CallToAction;
