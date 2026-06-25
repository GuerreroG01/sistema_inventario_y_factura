export default function ProfitabilitySkeleton(){

    return (

        <div className="
            rounded-3xl
            border
            border-gray-200/80
            bg-white
            p-6
            md:p-8
            shadow-sm
            animate-pulse
            w-full
        ">


            <div className="
                flex
                justify-between
                items-start
                mb-8
            ">

                <div>

                    <div className="
                        h-6
                        bg-gray-200
                        rounded-lg
                        w-48
                        mb-3
                    "/>


                    <div className="
                        h-3
                        bg-gray-100
                        rounded-md
                        w-72
                    "/>

                </div>



                <div className="
                    h-9
                    bg-gray-200
                    rounded-full
                    w-32
                "/>


            </div>




            <div className="
                h-9
                bg-gray-100
                rounded-xl
                w-full
                mb-8
            "/>




            <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                gap-4
            ">


                {
                    [1,2,3,4,5,6].map(item=>(

                        <div
                            key={item}
                            className="
                                h-28
                                bg-gray-50
                                rounded-2xl
                                border
                                border-gray-100
                            "
                        />

                    ))
                }


            </div>


        </div>

    );
}