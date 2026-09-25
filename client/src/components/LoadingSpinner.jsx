export default function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="w-16 h-16 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
      {text && <p className="mt-4 text-xl font-medium text-gray-600">{text}</p>}
    </div>
  );
}
