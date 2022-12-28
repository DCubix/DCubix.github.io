<script lang="ts">
  import ProfilePicture from "./lib/components/ProfilePicture.svelte";
  import { Github, Linkedin, Mail } from 'lucide-svelte';
  import data from '../public/data.json';
</script>

<main class="w-full md:w-[90%] lg:w-3/4 xl:w-2/3 2xl:w-5/12 m-auto p-3 py-5 md:p-12">
  <div class="flex">
    <ProfilePicture/>
    <div class="flex flex-col md:ml-6 items-start">
        <span class="m-0 mb-1 font-mono font-semibold text-4xl md:text-6xl">Diego Lopes</span>
        <span class="m-0 mb-3 font-normal text-2xl md:text-2xl text-white text-opacity-50">Software Developer</span>
        
        <ul class="flex gap-3">
            <li>
              <a href="https://github.com/DCubix" title="GitHub" target="_blank" class="text-color-theme inline-block" rel="noreferrer">
                <Github size={32} />
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/diego-lopes-a47056177/" title="LinkedIn" target="_blank" class="text-color-theme inline-block" rel="noreferrer">
                <Linkedin size={32} />
              </a>
            </li>
            <li>
              <a href="mailto:diego95lopes@gmail.com" title="E-mail" target="_blank" class="text-color-theme inline-block" rel="noreferrer">
                <Mail size={32} />
              </a>
            </li>
        </ul>
    </div>
  </div>

  <h1 class="text-2xl font-semibold my-5">My Gallery</h1>
  <div class="w-full">
    {#each data as item}
      <div class="bg-black bg-opacity-30 p-5 rounded-3xl my-2">
        <div class="flex flex-col">
          <span class="font-semibold text-xl">{item.name}</span>
          <span class="text-white text-opacity-70 mb-3">{item.description}</span>
        </div>
        <div class="grid-tiles">
          {#each item.images as image}
            <a
              href={image}
              rel="noreferrer"
              target="_blank"
              class="grid-tile bg-center bg-cover shadow-2xl"
              style={"background-image: url('" + image + "')"}>
            </a>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</main>
