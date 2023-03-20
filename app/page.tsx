import { queryBuilder } from "app/api/books";
import Image from "next/image";
import { YearNavigation } from "components/year-navigation";
import Tweet from "./tweet";

async function getBooks() {
  const data = await queryBuilder
    .selectFrom("books")
    .select([
      "id",
      "name",
      "cover",
      "description",
      "quote",
      "source",
      "date",
      "amazon",
    ])
    .orderBy("date", "desc")
    .execute();
  return data;
}

export default async function HomePage() {
  let entries;
  try {
    const [booksRes] = await Promise.allSettled([getBooks()]);

    if (booksRes.status === "fulfilled" && booksRes.value[0]) {
      entries = booksRes.value;
    } else {
      console.error(booksRes);
    }
  } catch (error) {
    console.error(error);
  }

  let years: number[] = [];
  if (entries) {
    const yearsSet = new Set(
      entries.map((entry) => new Date(entry.date).getFullYear())
    );
    years = Array.from(yearsSet).sort((a, b) => a - b);
  }

  return (
    <section>
      <h1 className="text-4xl font-bold mb-4">Elon Reads</h1>
      <p className="text-lg mb-8">
        📚🚀 A showcase of books that inspire Elon Musk.
      </p>
      <YearNavigation years={years} />

      {entries?.map((book) => {
        const recommendedAtYear = new Date(book.date).getFullYear();
        return (
          <div
            key={book.id}
            data-year={recommendedAtYear}
            className="py-8 md:flex"
          >
            <div className="md:flex items-center rounded-lg shadow-lg overflow-hidden">
              <div className="w-1/2 md:w-1/3 mb-4 md:mb-0">
                <Image
                  src={book.cover}
                  alt="Placeholder Image"
                  width={1653}
                  height={2560}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="px-6"></div>
              <div className="md:w-2/3 py-4">
                <h2 className="text-2xl font-bold mb-2">{book.name}</h2>
                <p className="text-base whitespace-pre-line">
                  {book.description}
                </p>
                <div className="divide-y divide-[#a8aaad] md:divide-y-8"></div>
                {book.quote && book.source && book.date && (
                  <div className="mt-8">
                    <Tweet
                      text={book.quote}
                      source={book.source}
                      date={book.date}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
