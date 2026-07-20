import { License } from "@/types/License";

export default function LicenseInfo({
    license
}:{
    license:License
}){
    return (
        <div className="
            rounded-2xl
            border
            border-gray-100
            bg-white
            p-6
            shadow-sm
            mb-8
        ">
            <h2 className="
                text-lg
                font-bold
                text-gray-900
                mb-5
            ">
                Información de licencia
            </h2>
            <div className="space-y-4 text-sm">
                <p>
                    <b className="text-gray-700">
                        Clave:
                    </b>{" "}
                    <span className="font-mono text-gray-500">
                        {license.license_key}
                    </span>
                </p>
                <p>
                    <b className="text-gray-700">
                        Activada:
                    </b>{" "}
                    {
                        license.activated_at
                        ?
                        new Date(
                            license.activated_at
                        ).toLocaleDateString()
                        :
                        "-"
                    }
                </p>
                <p>
                    <b className="text-gray-700">
                        Expira:
                    </b>{" "}
                    {
                        license.expires_at
                        ?
                        new Date(
                            license.expires_at
                        ).toLocaleDateString()
                        :
                        "Nunca"
                    }
                </p>
            </div>
        </div>
    );
}