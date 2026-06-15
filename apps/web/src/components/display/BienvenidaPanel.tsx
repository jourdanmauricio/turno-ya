interface Props {
  nombreApp: string
  horarioApertura: string
  horarioCierre: string
}

export default function BienvenidaPanel({ nombreApp, horarioApertura, horarioCierre }: Props) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 bg-white">
      <span className="text-7xl font-black text-primary">{nombreApp}</span>
      <p className="text-5xl text-text-main">Bienvenidos</p>
      <p className="text-2xl text-text-muted text-center px-4">
        Lunes a Viernes {horarioApertura} - {horarioCierre}
      </p>
    </div>
  )
}
